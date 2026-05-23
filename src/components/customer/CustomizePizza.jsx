import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { useCart } from '../../contexts/CartContext'
import { calcPizzaPrice, formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { X, Plus, Minus, ChevronDown } from 'lucide-react'

export default function CustomizePizza({ flavor, onClose }) {
  const { addItem } = useCart()
  const [pricing, setPricing] = useState(null)
  const [allFlavors, setAllFlavors] = useState([])
  const [size, setSize] = useState('m')
  const [dough, setDough] = useState('media')
  const [crust, setCrust] = useState(false)
  const [crustFlavor, setCrustFlavor] = useState('')
  const [flavor2, setFlavor2] = useState(null)
  const [showFlavor2, setShowFlavor2] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [observations, setObservations] = useState('')

  useEffect(() => {
    api.get('/settings?key=pricing').then(setPricing)
    api.get('/flavors').then((data) =>
      setAllFlavors((data || []).filter((f) => f.available && f.id !== flavor.id))
    )
  }, [flavor.id])

  if (!pricing) {
    return (
      <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
        <div className="flex-1 bg-black/50" />
        <div className="bg-white rounded-t-3xl w-full p-10 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const sizeMultiplier = pricing.sizes[size]?.multiplier || 1
  const pizzaPrice = calcPizzaPrice(flavor, flavor2, sizeMultiplier)
  const unitPrice = pizzaPrice + (crust ? pricing.crustPrice : 0)
  const total = unitPrice * quantity

  function addToCart() {
    const pizzaName = flavor2 ? `${flavor.name} / ${flavor2.name}` : flavor.name
    addItem({ pizzaId: flavor.id, pizzaName, pizza1: flavor, pizza2: flavor2 || null,
      size, sizeLabel: pricing.sizes[size]?.label, dough, crust,
      crustFlavor: crust ? crustFlavor : '', quantity, unitPrice, observations })
    toast.success(`${pizzaName} adicionada!`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="flex-1 bg-black/50" />
      <div className="bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white rounded-t-3xl flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-lg">{flavor.name}</h2>
            <p className="text-xs text-gray-400">{flavor.description}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 py-4 space-y-6">
          {/* Tamanho */}
          <section>
            <h3 className="section-title mb-3">Tamanho</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(pricing.sizes).map(([key, s]) => (
                <button key={key} onClick={() => setSize(key)}
                  className={`border-2 rounded-2xl p-3 text-left transition-all ${size === key ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
                  <p className="font-bold text-sm">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.description}</p>
                  <p className="text-brand-500 font-bold text-sm mt-1">{formatCurrency(calcPizzaPrice(flavor, flavor2, s.multiplier))}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Massa */}
          <section>
            <h3 className="section-title mb-3">Tipo de Massa</h3>
            <div className="grid grid-cols-3 gap-2">
              {pricing.doughs.map((d) => (
                <button key={d.id} onClick={() => setDough(d.id)}
                  className={`border-2 rounded-2xl p-3 text-center transition-all ${dough === d.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
                  <p className="font-bold text-sm">{d.label}</p>
                  <p className="text-xs text-gray-400">{d.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Borda */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title">Borda Recheada</h3>
              <span className="text-sm text-gray-500">+{formatCurrency(pricing.crustPrice)}</span>
            </div>
            <button onClick={() => { setCrust(!crust); if (crust) setCrustFlavor('') }}
              className={`w-full border-2 rounded-2xl p-4 flex items-center justify-between transition-all ${crust ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
              <span className="font-semibold text-sm">{crust ? 'Com borda recheada' : 'Sem borda recheada'}</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${crust ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`}>
                {crust && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
            </button>
            {crust && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {pricing.crustFlavors.map((cf) => (
                  <button key={cf} onClick={() => setCrustFlavor(cf)}
                    className={`border-2 rounded-xl p-2 text-sm font-semibold transition-all ${crustFlavor === cf ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600'}`}>
                    {cf}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Meia a meia */}
          <section>
            <button onClick={() => { setShowFlavor2(!showFlavor2); setFlavor2(null) }}
              className="flex items-center gap-2 text-brand-500 font-semibold text-sm">
              <ChevronDown className={`w-4 h-4 transition-transform ${showFlavor2 ? 'rotate-180' : ''}`} />
              {showFlavor2 ? 'Remover meia a meia' : 'Quero meia a meia (2 sabores)'}
            </button>
            {showFlavor2 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-gray-500">Escolha o 2º sabor:</p>
                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-gray-200 rounded-2xl p-2">
                  {allFlavors.map((f) => (
                    <button key={f.id} onClick={() => setFlavor2(f)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all ${flavor2?.id === f.id ? 'bg-brand-50 border border-brand-200' : 'hover:bg-gray-50'}`}>
                      <span className="text-xl">{f.emoji}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{f.name}</p>
                        <p className="text-xs text-gray-400">{formatCurrency(f.price)}</p>
                      </div>
                      {flavor2?.id === f.id && <div className="w-3 h-3 rounded-full bg-brand-500" />}
                    </button>
                  ))}
                </div>
                {flavor2 && (
                  <p className="text-xs text-brand-500 font-medium">
                    Preço baseado no sabor mais caro: {flavor2.price > flavor.price ? flavor2.name : flavor.name}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Observações */}
          <section>
            <h3 className="section-title mb-3">Observações</h3>
            <textarea value={observations} onChange={(e) => setObservations(e.target.value)}
              className="input resize-none" rows={3} placeholder="Ex: sem cebola, sem azeitona, pouco sal..." />
          </section>

          {/* Quantidade */}
          <section>
            <h3 className="section-title mb-3">Quantidade</h3>
            <div className="flex items-center gap-4">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-2xl font-bold w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4">
          <button onClick={addToCart} className="btn-primary">Adicionar · {formatCurrency(total)}</button>
        </div>
      </div>
    </div>
  )
}
