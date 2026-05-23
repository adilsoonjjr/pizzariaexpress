import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { PAYMENT_METHODS, formatCurrency } from '../../utils/helpers'
import { notify } from '../../utils/notifications'
import toast from 'react-hot-toast'
import { MapPin, CreditCard, ChevronLeft } from 'lucide-react'

export default function Checkout() {
  const navigate = useNavigate()
  const { profile, updateProfile } = useAuth()
  const { items, subtotal, clearCart } = useCart()
  const [delivery, setDelivery] = useState(null)
  const [selectedZone, setSelectedZone] = useState(null)
  const [payment, setPayment] = useState('pix')
  const [change, setChange] = useState('')
  const [loading, setLoading] = useState(false)
  const [addr, setAddr] = useState({
    street: profile?.address?.street || '',
    number: profile?.address?.number || '',
    complement: profile?.address?.complement || '',
    city: profile?.address?.city || '',
  })

  useEffect(() => {
    api.get('/settings?key=delivery').then(setDelivery)
  }, [])

  const handleAddr = (e) => setAddr((a) => ({ ...a, [e.target.name]: e.target.value }))
  const zone = delivery?.zones.find((z) => z.id === selectedZone)
  const deliveryFee = zone?.fee || 0
  const total = subtotal + deliveryFee

  async function placeOrder() {
    if (!addr.street || !addr.number || !addr.city) return toast.error('Preencha o endereço completo')
    if (!selectedZone) return toast.error('Selecione o bairro para calcular o frete')
    if (!items.length) return toast.error('Carrinho vazio')

    setLoading(true)
    try {
      await updateProfile({ address: addr })

      await api.post('/orders', {
        customer_name: profile.name,
        customer_phone: profile.phone || '',
        delivery_address: { ...addr, neighborhood: zone.neighborhood },
        items: items.map((i) => ({
          pizza_id: i.pizzaId, pizza_name: i.pizzaName,
          size: i.size, size_label: i.sizeLabel,
          dough: i.dough, crust: i.crust, crust_flavor: i.crustFlavor || '',
          quantity: i.quantity, unit_price: i.unitPrice,
          subtotal: i.unitPrice * i.quantity,
          observations: i.observations || '',
        })),
        subtotal, delivery_fee: deliveryFee, total,
        payment_method: payment,
        payment_change: payment === 'dinheiro' && change ? parseFloat(change) : null,
        estimated_time: zone.estimatedTime,
      })

      clearCart()
      notify('success')
      toast.success('Pedido realizado! 🍕')
      navigate('/orders')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-32">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Finalizar Pedido</h1>
      </div>

      <div className="px-4 py-4 space-y-5">
        <div className="card p-4">
          <h2 className="section-title mb-3">Resumo</h2>
          {items.map((item) => (
            <div key={item.cartId} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-700">{item.quantity}x {item.pizzaName} <span className="text-gray-400">({item.sizeLabel})</span></span>
              <span className="font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3"><MapPin className="w-4 h-4 text-brand-500" /><h2 className="section-title">Endereço</h2></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2"><label className="label">Rua / Avenida</label><input name="street" value={addr.street} onChange={handleAddr} className="input" placeholder="Rua das Flores" /></div>
              <div><label className="label">Número</label><input name="number" value={addr.number} onChange={handleAddr} className="input" placeholder="123" /></div>
            </div>
            <div><label className="label">Complemento</label><input name="complement" value={addr.complement} onChange={handleAddr} className="input" placeholder="Apto 4B..." /></div>
            <div><label className="label">Cidade</label><input name="city" value={addr.city} onChange={handleAddr} className="input" placeholder="São Paulo" /></div>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="section-title mb-3">Bairro / Zona</h2>
          {delivery ? delivery.zones.map((z) => (
            <button key={z.id} onClick={() => setSelectedZone(z.id)}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 mb-2 transition-all ${selectedZone === z.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
              <div className="text-left"><p className="font-semibold text-sm">{z.neighborhood}</p><p className="text-xs text-gray-400">≈ {z.estimatedTime} min</p></div>
              <p className="font-bold text-brand-500">{formatCurrency(z.fee)}</p>
            </button>
          )) : <p className="text-gray-400 text-sm">Carregando...</p>}
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3"><CreditCard className="w-4 h-4 text-brand-500" /><h2 className="section-title">Pagamento</h2></div>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button key={m.id} onClick={() => setPayment(m.id)}
                className={`border-2 rounded-2xl p-3 text-left transition-all ${payment === m.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
                <p className="text-xl">{m.icon}</p><p className="font-semibold text-sm mt-1">{m.label}</p>
              </button>
            ))}
          </div>
          {payment === 'dinheiro' && (
            <div className="mt-3"><label className="label">Troco para</label>
            <input type="number" value={change} onChange={(e) => setChange(e.target.value)} className="input" placeholder="Ex: 100.00" /></div>
          )}
        </div>

        <div className="card p-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Entrega {zone ? `(${zone.neighborhood})` : ''}</span><span>{zone ? formatCurrency(deliveryFee) : '—'}</span></div>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-3 mt-3">
            <span>Total</span><span className="text-brand-500">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="px-4">
        <button onClick={placeOrder} disabled={loading} className="btn-primary py-4 text-base">
          {loading ? 'Enviando...' : `Fazer Pedido · ${formatCurrency(total)}`}
        </button>
      </div>
    </div>
  )
}
