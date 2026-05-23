import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { Plus, Trash2, Save } from 'lucide-react'

export default function AdminSettings() {
  const [pricing, setPricing] = useState(null)
  const [delivery, setDelivery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/settings?key=pricing'),
      api.get('/settings?key=delivery'),
    ]).then(([p, d]) => {
      if (p) setPricing(p)
      if (d) setDelivery(d)
      setLoading(false)
    })
  }, [])

  async function savePricing() {
    setSaving(true)
    try {
      await api.put('/settings', { key: 'pricing', value: pricing })
      toast.success('Preços salvos!')
    } catch (err) {
      toast.error('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveDelivery() {
    setSaving(true)
    try {
      await api.put('/settings', { key: 'delivery', value: delivery })
      toast.success('Configurações de entrega salvas!')
    } catch (err) {
      toast.error('Erro ao salvar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  function updateSize(key, field, value) {
    setPricing((p) => ({
      ...p,
      sizes: { ...p.sizes, [key]: { ...p.sizes[key], [field]: field === 'multiplier' ? parseFloat(value) : value } },
    }))
  }

  function updateZone(idx, field, value) {
    setDelivery((d) => {
      const zones = [...d.zones]
      zones[idx] = { ...zones[idx], [field]: ['fee', 'estimatedTime'].includes(field) ? parseFloat(value) : value }
      return { ...d, zones }
    })
  }

  function addZone() {
    setDelivery((d) => ({
      ...d,
      zones: [...d.zones, { id: `z${Date.now()}`, neighborhood: '', fee: 0, estimatedTime: 45 }],
    }))
  }

  function removeZone(idx) {
    setDelivery((d) => ({ ...d, zones: d.zones.filter((_, i) => i !== idx) }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="pb-8">
      <div className="bg-white border-b border-gray-100 px-5 py-4">
        <h1 className="text-xl font-bold">Configurações</h1>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Tamanhos */}
        <div className="card p-4">
          <h2 className="section-title mb-1">Tamanhos e Preços</h2>
          <p className="text-xs text-gray-400 mb-4">Multiplicador aplicado sobre o preço base do sabor</p>

          {pricing && (
            <div className="space-y-3">
              {Object.entries(pricing.sizes).map(([key, size]) => (
                <div key={key} className="bg-gray-50 rounded-2xl p-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="label text-xs">Sigla</label>
                      <input value={key.toUpperCase()} readOnly className="input bg-gray-100 text-gray-500 text-sm py-2 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="label text-xs">Nome</label>
                      <input value={size.label} onChange={(e) => updateSize(key, 'label', e.target.value)} className="input text-sm py-2" />
                    </div>
                    <div>
                      <label className="label text-xs">Multiplicador</label>
                      <input type="number" step="0.01" value={size.multiplier} onChange={(e) => updateSize(key, 'multiplier', e.target.value)} className="input text-sm py-2" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="label text-xs">Descrição</label>
                    <input value={size.description} onChange={(e) => updateSize(key, 'description', e.target.value)} className="input text-sm py-2" />
                  </div>
                </div>
              ))}

              <div className="bg-gray-50 rounded-2xl p-3">
                <label className="label">Preço da borda recheada (R$)</label>
                <input type="number" step="0.50" value={pricing.crustPrice}
                  onChange={(e) => setPricing((p) => ({ ...p, crustPrice: parseFloat(e.target.value) }))}
                  className="input" />
              </div>
            </div>
          )}

          <button onClick={savePricing} disabled={saving} className="btn-primary mt-4 py-2.5 text-sm">
            <Save className="w-4 h-4 inline mr-1.5" />
            Salvar preços
          </button>
        </div>

        {/* Zonas de entrega */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Zonas de Entrega</h2>
            <button onClick={addZone} className="flex items-center gap-1 text-brand-500 font-semibold text-sm">
              <Plus className="w-4 h-4" /> Zona
            </button>
          </div>

          {delivery && (
            <div className="space-y-3">
              {delivery.zones.map((zone, idx) => (
                <div key={zone.id} className="bg-gray-50 rounded-2xl p-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3">
                      <label className="label text-xs">Bairro / Região</label>
                      <input value={zone.neighborhood} onChange={(e) => updateZone(idx, 'neighborhood', e.target.value)} className="input text-sm py-2" placeholder="Centro" />
                    </div>
                    <div>
                      <label className="label text-xs">Frete (R$)</label>
                      <input type="number" step="0.50" value={zone.fee} onChange={(e) => updateZone(idx, 'fee', e.target.value)} className="input text-sm py-2" />
                    </div>
                    <div>
                      <label className="label text-xs">Tempo (min)</label>
                      <input type="number" value={zone.estimatedTime} onChange={(e) => updateZone(idx, 'estimatedTime', e.target.value)} className="input text-sm py-2" />
                    </div>
                    <div className="flex items-end">
                      <button onClick={() => removeZone(idx)} className="w-full bg-red-50 text-red-400 rounded-xl p-2.5 hover:bg-red-100 flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-gray-50 rounded-2xl p-3">
                <label className="label">Pedido mínimo (R$)</label>
                <input type="number" step="5" value={delivery.minOrder}
                  onChange={(e) => setDelivery((d) => ({ ...d, minOrder: parseFloat(e.target.value) }))}
                  className="input" />
              </div>
            </div>
          )}

          <button onClick={saveDelivery} disabled={saving} className="btn-primary mt-4 py-2.5 text-sm">
            <Save className="w-4 h-4 inline mr-1.5" />
            Salvar entrega
          </button>
        </div>
      </div>
    </div>
  )
}
