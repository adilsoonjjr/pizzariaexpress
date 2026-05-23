import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { ORDER_STATUS, formatCurrency } from '../../utils/helpers'
import { notify } from '../../utils/notifications'
import toast from 'react-hot-toast'
import { ClipboardList } from 'lucide-react'

const STEPS = ['pending', 'accepted', 'preparing', 'delivering', 'delivered']

function StatusTimeline({ status }) {
  const current = ORDER_STATUS[status]?.step ?? 0
  if (status === 'cancelled') return (
    <div className="mt-3"><span className="badge bg-red-100 text-red-600">Pedido cancelado</span></div>
  )
  return (
    <div className="mt-3">
      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-none transition-all ${i <= current ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < current ? 'bg-brand-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
      <p className="text-xs text-brand-500 font-semibold mt-2">{ORDER_STATUS[status]?.label}</p>
    </div>
  )
}

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const prevStatuses = useRef({})

  async function fetchOrders() {
    const data = await api.get('/orders').catch(() => null)
    if (!data) return
    data.forEach((o) => {
      const prev = prevStatuses.current[o.id]
      if (prev && prev !== o.status) {
        notify('notify')
        toast.success(`Pedido ${ORDER_STATUS[o.status]?.label}`, { duration: 5000 })
      }
      prevStatuses.current[o.id] = o.status
    })
    setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
    const timer = setInterval(fetchOrders, 6000) // poll a cada 6s
    return () => clearInterval(timer)
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!orders.length) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-8">
      <ClipboardList className="w-16 h-16 text-gray-200 mb-4" />
      <h2 className="text-xl font-bold text-gray-700">Nenhum pedido ainda</h2>
      <p className="text-gray-400 mt-1">Seus pedidos aparecerão aqui</p>
    </div>
  )

  return (
    <div className="pb-24">
      <div className="bg-white border-b border-gray-100 px-5 py-4">
        <h1 className="text-xl font-bold">Meus Pedidos</h1>
      </div>
      <div className="px-4 py-4 space-y-4">
        {orders.map((order) => {
          const dateStr = order.created_at
            ? new Date(order.created_at).toLocaleDateString('pt-BR', { day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit' })
            : '—'
          return (
            <div key={order.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div><p className="text-xs text-gray-400">#{order.id.slice(-6).toUpperCase()}</p><p className="text-xs text-gray-400">{dateStr}</p></div>
                <span className={`badge ${ORDER_STATUS[order.status]?.color}`}>{ORDER_STATUS[order.status]?.label}</span>
              </div>
              <StatusTimeline status={order.status} />
              <div className="mt-3 pt-3 border-t border-gray-100">
                {order.items.map((item, i) => (
                  <p key={i} className="text-sm text-gray-600">{item.quantity}x {item.pizza_name} <span className="text-gray-400">({item.size_label})</span></p>
                ))}
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  <p>Entrega: {formatCurrency(order.delivery_fee)}</p>
                  {order.estimated_time && !['delivered','cancelled'].includes(order.status) && <p>≈ {order.estimated_time} min</p>}
                </div>
                <p className="font-bold text-brand-500">{formatCurrency(order.total)}</p>
              </div>
              {order.items.some((i) => i.observations) && (
                <div className="mt-2 bg-amber-50 rounded-xl p-3">
                  <p className="text-xs text-amber-700 font-medium">Observações:</p>
                  {order.items.filter((i) => i.observations).map((i, idx) => (
                    <p key={idx} className="text-xs text-amber-600 italic">"{i.observations}"</p>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
