import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { CATEGORY_COLORS, CATEGORY_LABELS, formatCurrency } from '../../utils/helpers'
import CustomizePizza from '../../components/customer/CustomizePizza'
import { Search, ChevronRight } from 'lucide-react'

const CATEGORIES = ['todos', 'tradicional', 'especial', 'premium', 'doce']

export default function Home() {
  const { profile } = useAuth()
  const [flavors, setFlavors] = useState([])
  const [category, setCategory] = useState('todos')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/flavors').then((data) => setFlavors(data || []))
  }, [])

  const filtered = flavors.filter((f) => {
    const available = f.available
    const matchCat = category === 'todos' || f.category === category
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
    return available && matchCat && matchSearch
  })

  const categoryCounts = CATEGORIES.reduce((acc, c) => {
    const avail = flavors.filter((f) => f.available)
    acc[c] = c === 'todos' ? avail.length : avail.filter((f) => f.category === c).length
    return acc
  }, {})

  return (
    <div className="pb-24">
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-5 pt-5 pb-8">
        <p className="text-brand-100 text-sm">Olá, {profile?.name?.split(' ')[0]} 👋</p>
        <h1 className="text-white text-2xl font-black mt-1">O que vai pedir hoje?</h1>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white rounded-2xl py-3 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="Buscar sabor..."
          />
        </div>
      </div>

      <div className="flex gap-2 px-4 py-4 overflow-x-auto">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-none px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              category === c ? 'bg-brand-500 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {c === 'todos' ? 'Todos' : CATEGORY_LABELS[c]}
            <span className="ml-1.5 opacity-70">({categoryCounts[c]})</span>
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🔍</div>
            <p>Nenhum sabor encontrado</p>
          </div>
        )}
        {filtered.map((flavor) => (
          <button
            key={flavor.id}
            onClick={() => setSelected(flavor)}
            className={`w-full card border-2 p-4 flex items-center gap-4 text-left transition-transform active:scale-[0.98] ${
              CATEGORY_COLORS[flavor.category] || 'bg-white border-gray-100'
            }`}
          >
            <div className="text-4xl w-14 h-14 flex items-center justify-center bg-white rounded-2xl shadow-sm flex-none">
              {flavor.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-gray-800 text-base leading-tight">{flavor.name}</p>
                <span className={`badge flex-none ${
                  flavor.category === 'premium' ? 'bg-purple-100 text-purple-700' :
                  flavor.category === 'especial' ? 'bg-orange-100 text-orange-700' :
                  flavor.category === 'doce'     ? 'bg-pink-100 text-pink-700' :
                  'bg-amber-100 text-amber-700'
                }`}>{CATEGORY_LABELS[flavor.category]}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{flavor.description}</p>
              <p className="text-brand-500 font-bold mt-1.5">a partir de {formatCurrency(flavor.price * 0.75)}</p>
            </div>
            <ChevronRight className="text-gray-300 w-5 h-5 flex-none" />
          </button>
        ))}
      </div>

      {selected && <CustomizePizza flavor={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
