import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { CATEGORY_COLORS, CATEGORY_LABELS, formatCurrency } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'

const EMPTY = { name:'', description:'', price:'', category:'tradicional', emoji:'🍕', available:true }
const CATEGORIES = ['tradicional','especial','premium','doce']
const EMOJIS = ['🍕','🧀','🥓','🦐','🥩','🐟','🍖','🍗','🥦','🍄','🫑','🍫','🍓','🍒','🫐']

function FlavorForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY)
  const [loading, setLoading] = useState(false)
  const handle = (e) => { const {name,value,type,checked}=e.target; setForm((f)=>({...f,[name]:type==='checkbox'?checked:value})) }

  async function submit(e) {
    e.preventDefault()
    if (!form.name || !form.price) return toast.error('Nome e preço são obrigatórios')
    setLoading(true)
    try { await onSave({...form, price:parseFloat(form.price)}) }
    finally { setLoading(false) }
  }

  return (
    <div className="card p-4 border-2 border-brand-200">
      <h3 className="font-bold mb-4">{initial?.id ? 'Editar sabor' : 'Novo sabor'}</h3>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label">Ícone</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => setForm((f)=>({...f,emoji:e}))}
                className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${form.emoji===e?'border-brand-500 bg-brand-50':'border-gray-200'}`}>{e}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="label">Nome</label><input name="name" value={form.name} onChange={handle} className="input" required /></div>
          <div><label className="label">Preço base (R$)</label><input name="price" type="number" step="0.01" value={form.price} onChange={handle} className="input" required /></div>
          <div><label className="label">Categoria</label>
            <select name="category" value={form.category} onChange={handle} className="input">
              {CATEGORIES.map((c)=><option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <div className="col-span-2"><label className="label">Descrição / Ingredientes</label><input name="description" value={form.description} onChange={handle} className="input" /></div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="available" checked={form.available} onChange={handle} className="w-4 h-4 accent-brand-500" />
          <span className="text-sm font-medium">Disponível no cardápio</span>
        </label>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 text-sm"><Check className="w-4 h-4 inline mr-1" />{loading?'Salvando...':'Salvar'}</button>
          <button type="button" onClick={onCancel} className="bg-gray-100 text-gray-600 rounded-2xl flex-none px-4 py-2.5 hover:bg-gray-200"><X className="w-4 h-4" /></button>
        </div>
      </form>
    </div>
  )
}

export default function AdminFlavors() {
  const [flavors, setFlavors] = useState([])
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)

  useEffect(() => { api.get('/flavors').then((d) => setFlavors(d || [])) }, [])

  async function saveNew(data) {
    await api.post('/flavors', data)
    toast.success('Sabor adicionado!')
    setAdding(false)
    api.get('/flavors').then(setFlavors)
  }
  async function saveEdit(id, data) {
    await api.put('/flavors', { id, ...data })
    toast.success('Atualizado!')
    setEditing(null)
    api.get('/flavors').then(setFlavors)
  }
  async function deleteFlavor(id, name) {
    if (!confirm(`Excluir "${name}"?`)) return
    await api.delete(`/flavors?id=${id}`)
    toast.success('Excluído')
    setFlavors((f) => f.filter((x) => x.id !== id))
  }
  async function toggle(flavor) {
    await api.put('/flavors', { ...flavor, available: !flavor.available })
    setFlavors((list) => list.map((f) => f.id===flavor.id ? {...f,available:!f.available} : f))
  }

  return (
    <div className="pb-8">
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Sabores ({flavors.length})</h1>
        <button onClick={() => {setAdding(true);setEditing(null)}} className="flex items-center gap-1.5 bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>
      <div className="px-4 py-4 space-y-3">
        {adding && <FlavorForm onSave={saveNew} onCancel={() => setAdding(false)} />}
        {flavors.map((flavor) => (
          <div key={flavor.id}>
            {editing===flavor.id ? (
              <FlavorForm initial={flavor} onSave={(d) => saveEdit(flavor.id,d)} onCancel={() => setEditing(null)} />
            ) : (
              <div className={`card border-2 p-4 flex items-center gap-3 ${flavor.available ? CATEGORY_COLORS[flavor.category]||'bg-white border-gray-100' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                <div className="text-3xl w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-none shadow-sm">{flavor.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{flavor.name}</p>
                    {!flavor.available && <span className="badge bg-gray-200 text-gray-500 text-xs">Indisponível</span>}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{flavor.description}</p>
                  <p className="text-brand-500 font-bold text-sm mt-1">{formatCurrency(flavor.price)}</p>
                </div>
                <div className="flex flex-col gap-1.5 flex-none">
                  <button onClick={() => toggle(flavor)} className="p-2 rounded-lg bg-white/80 text-base">{flavor.available?'👁':'🚫'}</button>
                  <button onClick={() => {setEditing(flavor.id);setAdding(false)}} className="p-2 rounded-lg bg-white/80"><Pencil className="w-3.5 h-3.5 text-blue-500" /></button>
                  <button onClick={() => deleteFlavor(flavor.id,flavor.name)} className="p-2 rounded-lg bg-white/80"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
