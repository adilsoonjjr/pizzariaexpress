import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { useCart } from '../../contexts/CartContext'
import { calcPizzaPrice, formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { X, Plus, Minus, Trash2 } from 'lucide-react'

const MAX_FLAVORS = 4

export default function CustomizePizza({ flavor, onClose }) {
  const { addItem } = useCart()
  const [pricing, setPricing] = useState(null)
  const [allFlavors, setAllFlavors] = useState([])
  const [size, setSize] = useState('m')
  const [dough, setDough] = useState('media')
  const [crust, setCrust] = useState(false)
  const [crustFlavor, setCrustFlavor] = useState('')
  const [extraFlavors, setExtraFlavors] = useState([])   // slots além do sabor principal
  const [openSlot, setOpenSlot] = useState(null)         // qual slot está com picker aberto
  const [quantity, setQuantity] = useState(1)
  const [observations, setObservations] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/settings?key=pricing').then(setPricing)
    api.get('/flavors').then((data) =>
      setAllFlavors((data || []).filter((f) => f.available))
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

  const allSelected = [flavor, ...extraFlavors.filter(Boolean)]
  const sizeMultiplier = pricing.sizes[size]?.multiplier || 1
  const pizzaPrice = calcPizzaPrice(allSelected, sizeMultiplier)
  const unitPrice = pizzaPrice + (crust ? pricing.crustPrice : 0)
  const total = unitPrice * quantity

  // Sabores disponíveis para um slot (exclui os já selecionados)
  const selectedIds = new Set(allSelected.map((f) => f.id))
  const available = allFlavors.filter(
    (f) => !selectedIds.has(f.id) || extraFlavors[openSlot]?.id === f.id
  )
  const filtered = search
    ? available.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
    : available

  function addSlot() {
    if (allSelected.length >= MAX_FLAVORS) return
    setExtraFlavors((prev) => [...prev, null])
    setOpenSlot(extraFlavors.length)
    setSearch('')
  }

  function removeSlot(idx) {
    setExtraFlavors((prev) => prev.filter((_, i) => i !== idx))
    setOpenSlot(null)
  }

  function pickFlavor(idx, f) {
    setExtraFlavors((prev) => prev.map((x, i) => (i === idx ? f : x)))
    setOpenSlot(null)
    setSearch('')
  }

  function toggleSlot(idx) {
    setOpenSlot(openSlot === idx ? null : idx)
    setSearch('')
  }

  function addToCart() {
    if (extraFlavors.some((f) => f === null)) {
      return toast.error('Escolha o sabor para cada fatia adicionada')
    }
    const pizzaName = allSelected.map((f) => f.name).join(' / ')
    addItem({
      pizzaId: flavor.id,
      pizzaName,
      flavors: allSelected,
      size,
      sizeLabel: pricing.sizes[size]?.label,
      dough,
      crust,
      crustFlavor: crust ? crustFlavor : '',
      quantity,
      unitPrice,
      observations,
    })
    toast.success(`${pizzaName} adicionada!`)
    onClose()
  }

  const slotLabel = ['inteira', 'meia a meia', 'em terços', 'em quartos']
  const totalSlots = 1 + extraFlavors.length

  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="flex-1 bg-black/50" />
      <div className="bg-white rounded-t-3xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl flex items-center justify-between px-5 py-4 border-b border-gray-100 z-10">
          <div>
            <h2 className="font-bold text-lg">{flavor.name}</h2>
            <p className="text-xs text-gray-400">{flavor.description}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-5 py-4 space-y-6">

          {/* ── Sabores ─────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title">
                Sabores
                <span className="ml-2 text-xs font-normal text-gray-400">
                  pizza {slotLabel[totalSlots - 1]} ({totalSlots}/{MAX_FLAVORS})
                </span>
              </h3>
              {totalSlots < MAX_FLAVORS && (
                <button onClick={addSlot}
                  className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-xl font-semibold text-sm">
                  <Plus className="w-4 h-4" /> + Sabor
                </button>
              )}
            </div>

            <div className="space-y-2">
              {/* Sabor principal — fixo */}
              <div className="flex items-center gap-3 bg-brand-50 border-2 border-brand-200 rounded-2xl p-3">
                <span className="text-2xl">{flavor.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{flavor.name}</p>
                  <p className="text-xs text-gray-400">{formatCurrency(flavor.price)}</p>
                </div>
                <span className="text-xs text-brand-500 font-semibold bg-brand-100 px-2 py-0.5 rounded-full">
                  {totalSlots === 1 ? 'inteira' : `1/${totalSlots}`}
                </span>
              </div>

              {/* Slots extras */}
              {extraFlavors.map((ef, idx) => (
                <div key={idx}>
                  <div
                    onClick={() => toggleSlot(idx)}
                    className={`flex items-center gap-3 border-2 rounded-2xl p-3 cursor-pointer transition-all
                      ${ef
                        ? 'border-brand-200 bg-brand-50'
                        : 'border-dashed border-gray-300 bg-gray-50'}`}>
                    {ef ? (
                      <>
                        <span className="text-2xl">{ef.emoji}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{ef.name}</p>
                          <p className="text-xs text-gray-400">{formatCurrency(ef.price)}</p>
                        </div>
                        <span className="text-xs text-brand-500 font-semibold bg-brand-100 px-2 py-0.5 rounded-full mr-1">
                          {`${idx + 2}/${totalSlots}`}
                        </span>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 flex-1">
                        Toque para escolher o {idx + 2}º sabor
                      </p>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSlot(idx) }}
                      className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 flex-none ml-1">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>

                  {/* Picker inline */}
                  {openSlot === idx && (
                    <div className="mt-1 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder={`Buscar ${idx + 2}º sabor...`}
                          className="input py-2 text-sm"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <div className="max-h-52 overflow-y-auto">
                        {filtered.length === 0 && (
                          <p className="text-center text-gray-400 text-sm py-4">Nenhum sabor encontrado</p>
                        )}
                        {filtered.map((f) => (
                          <button key={f.id} onClick={() => pickFlavor(idx, f)}
                            className="w-full flex items-center gap-3 p-3 text-left hover:bg-brand-50 transition-all border-b border-gray-50 last:border-0">
                            <span className="text-xl">{f.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">{f.name}</p>
                              <p className="text-xs text-gray-400 truncate">{f.description}</p>
                            </div>
                            <p className="text-brand-500 font-bold text-sm flex-none">{formatCurrency(f.price)}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {allSelected.length > 1 && (
              <p className="text-xs text-brand-500 font-medium mt-2">
                Preço pelo sabor mais caro:{' '}
                <strong>{[...allSelected].sort((a, b) => b.price - a.price)[0].name}</strong>
              </p>
            )}
          </section>

          {/* ── Tamanho ──────────────────────────── */}
          <section>
            <h3 className="section-title mb-3">Tamanho</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(pricing.sizes).map(([key, s]) => (
                <button key={key} onClick={() => setSize(key)}
                  className={`border-2 rounded-2xl p-3 text-left transition-all ${size === key ? 'border-brand-500 bg-brand-50' : 'border-gray-200'}`}>
                  <p className="font-bold text-sm">{s.label}</p>
                  <p className="text-xs text-gray-500">{s.description}</p>
                  <p className="text-brand-500 font-bold text-sm mt-1">
                    {formatCurrency(calcPizzaPrice(allSelected, s.multiplier))}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* ── Massa ────────────────────────────── */}
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

          {/* ── Borda ────────────────────────────── */}
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

          {/* ── Observações ──────────────────────── */}
          <section>
            <h3 className="section-title mb-3">Observações</h3>
            <textarea value={observations} onChange={(e) => setObservations(e.target.value)}
              className="input resize-none" rows={3}
              placeholder="Ex: sem cebola, sem azeitona, pouco sal..." />
          </section>

          {/* ── Quantidade ───────────────────────── */}
          <section>
            <h3 className="section-title mb-3">Quantidade</h3>
            <div className="flex items-center gap-4">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-2xl font-bold w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </section>
        </div>

        {/* Footer fixo */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4">
          <button onClick={addToCart} className="btn-primary">
            Adicionar · {formatCurrency(total)}
          </button>
        </div>
      </div>
    </div>
  )
}
