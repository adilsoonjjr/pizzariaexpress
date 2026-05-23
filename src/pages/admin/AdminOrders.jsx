import { useState, useEffect, useRef } from 'react'
import { api } from '../../lib/api'
import { ORDER_STATUS, PAYMENT_METHODS, formatCurrency } from '../../utils/helpers'
import { notify } from '../../utils/notifications'
import toast from 'react-hot-toast'
import { Phone, MapPin, ChevronDown } from 'lucide-react'

const STATUS_FLOW = ['pending','accepted','preparing','delivering','delivered']
const nextStatus = (s) => { const i = STATUS_FLOW.indexOf(s); return i < STATUS_FLOW.length-1 ? STATUS_FLOW[i+1] : null }

function OrderCard({ order, onRefresh }) {
  const [expanded, setExpanded] = useState(order.status === 'pending')
  const [loading, setLoading] = useState(false)

  async function advance() {
    const next = nextStatus(order.status)
    if (!next) return
    setLoading(true)
    try {
      await api.put('/orders', {
        id: order.id, status: next,
        status_history: [...(order.status_history||[]), { status: next, at: new Date().toISOString() }],
      })
      toast.success(`→ ${ORDER_STATUS[next].label}`)
      onRefresh()
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  async function cancel() {
    if (!confirm('Cancelar este pedido?')) return
    setLoading(true)
    try {
      await api.put('/orders', {
        id: order.id, status: 'cancelled',
        status_history: [...(order.status_history||[]), { status:'cancelled', at: new Date().toISOString() }],
      })
      toast.success('Cancelado')
      onRefresh()
    } catch (err) { toast.error(err.message) }
    finally { setLoading(false) }
  }

  const next = nextStatus(order.status)
  const payLabel = PAYMENT_METHODS.find((p) => p.id === order.payment_method)?.label || order.payment_method
  const timeStr = order.created_at ? new Date(order.created_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) : '—'

  return (
    <div className={`card overflow-hidden ${order.status==='pending' ? 'ring-2 ring-brand-400' : ''}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          {order.status==='pending' && <span className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-pulse flex-none" />}
          <div>
            <p className="font-bold">{order.customer_name}</p>
            <p className="text-xs text-gray-400">#{order.id.slice(-6).toUpperCase()} · {timeStr}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${ORDER_STATUS[order.status]?.color}`}>{ORDER_STATUS[order.status]?.label}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded?'rotate-180':''}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-3 pt-3">
            {order.customer_phone && (
              <a href={`tel:${order.customer_phone}`} className="flex items-center gap-1.5 text-sm text-brand-500 font-semibold">
                <Phone className="w-3.5 h-3.5" />{order.customer_phone}
              </a>
            )}
            <div className="flex items-start gap-1.5 text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5 mt-0.5 flex-none text-gray-400" />
              <span>{order.delivery_address?.street}, {order.delivery_address?.number}{order.delivery_address?.complement ? ` - ${order.delivery_address.complement}` : ''} · {order.delivery_address?.neighborhood} · {order.delivery_address?.city}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-3 space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="text-sm">
                <div className="flex justify-between font-semibold"><span>{item.quantity}x {item.pizza_name}</span><span>{formatCurrency(item.subtotal)}</span></div>
                <p className="text-xs text-gray-500">{item.size_label} · Massa {item.dough}{item.crust ? ` · Borda ${item.crust_flavor}` : ''}</p>
                {item.observations && <p className="text-xs text-amber-600 italic mt-0.5">⚠ {item.observations}</p>}
              </div>
            ))}
          </div>

          <div className="text-sm space-y-1">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Entrega</span><span>{formatCurrency(order.delivery_fee)}</span></div>
            <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-1"><span>Total</span><span className="text-brand-500">{formatCurrency(order.total)}</span></div>
            <p className="text-xs text-gray-400">Pagamento: {payLabel}{order.payment_change ? ` · Troco para ${formatCurrency(order.payment_change)}` : ''}</p>
          </div>

          {!['delivered','cancelled'].includes(order.status) && (
            <div className="flex gap-2">
              {next && <button onClick={advance} disabled={loading} className="btn-primary flex-1 py-2.5 text-sm">{loading ? '...' : `→ ${ORDER_STATUS[next]?.label}`}</button>}
              <button onClick={cancel} disabled={loading} className="bg-red-50 text-red-500 font-semibold flex-none px-4 py-2.5 rounded-2xl text-sm hover:bg-red-100">Cancelar</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('active')
  const prevCount = useRef(0)

  async function fetchOrders() {
    const data = await api.get('/orders').catch(() => null)
    if (!data) return
    const pending = data.filter((o) => o.status === 'pending').length
    if (pending > prevCount.current) {
      notify('order')
      toast.success('🍕 Novo pedido recebido!', { duration: 6000 })
    }
    prevCount.current = pending
    setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
    const timer = setInterval(fetchOrders, 6000)
    return () => clearInterval(timer)
  }, [])

  const FILTERS = [
    { id:'active',    label:'Ativos',     match:(o) => !['delivered','cancelled'].includes(o.status) },
    { id:'all',       label:'Todos',      match:() => true },
    { id:'delivered', label:'Entregues',  match:(o) => o.status==='delivered' },
    { id:'cancelled', label:'Cancelados', match:(o) => o.status==='cancelled' },
  ]
  const filtered = orders.filter(FILTERS.find((f) => f.id===filter).match)
  const pendingCount = orders.filter((o) => o.status==='pending').length

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="pb-8">
      <div className="bg-white border-b border-gray-100 px-5 py-4">
        <h1 className="text-xl font-bold">Pedidos</h1>
        {pendingCount > 0 && <p className="text-sm text-brand-500 font-semibold">{pendingCount} aguardando confirmação</p>}
      </div>
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`flex-none px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter===f.id?'bg-brand-500 text-white':'bg-white border border-gray-200 text-gray-500'}`}>
            {f.label} ({orders.filter(f.match).length})
          </button>
        ))}
      </div>
      <div className="px-4 space-y-3">
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400">Nenhum pedido nesta categoria</div>}
        {filtered.map((order) => <OrderCard key={order.id} order={order} onRefresh={fetchOrders} />)}
      </div>
    </div>
  )
}
