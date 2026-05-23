import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', adminCode: '',
  })
  const [loading, setLoading] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Senha deve ter ao menos 6 caracteres')
    setLoading(true)
    try {
      const role = await register(form)
      toast.success(role === 'admin' ? 'Conta admin criada!' : 'Conta criada com sucesso!')
      navigate(role === 'admin' ? '/admin' : '/')
    } catch (err) {
      toast.error(err.code === 'auth/email-already-in-use' ? 'Email já cadastrado' : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-500 to-brand-700 flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🍕</div>
          <h1 className="text-2xl font-black text-white">PizzaExpress</h1>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Criar conta</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="label">Nome completo</label>
              <input name="name" value={form.name} onChange={handle} className="input" placeholder="João Silva" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} className="input" placeholder="seu@email.com" required />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input name="phone" type="tel" value={form.phone} onChange={handle} className="input" placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className="label">Senha</label>
              <input name="password" type="password" value={form.password} onChange={handle} className="input" placeholder="Mínimo 6 caracteres" required />
            </div>

            <button
              type="button"
              onClick={() => setShowAdmin(!showAdmin)}
              className="text-xs text-gray-400 hover:text-gray-600 w-full text-center"
            >
              {showAdmin ? '− Ocultar' : '+ Sou administrador'}
            </button>

            {showAdmin && (
              <div>
                <label className="label">Código de admin</label>
                <input name="adminCode" value={form.adminCode} onChange={handle} className="input" placeholder="Código secreto" />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Já tem conta?{' '}
            <Link to="/login" className="text-brand-500 font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
