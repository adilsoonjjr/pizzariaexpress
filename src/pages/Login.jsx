import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const role = await login(form.email, form.password)
      navigate(role === 'admin' ? '/admin' : '/')
    } catch (err) {
      toast.error('Email ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-500 to-brand-700 flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🍕</div>
          <h1 className="text-3xl font-black text-white">PizzaExpress</h1>
          <p className="text-brand-100 text-sm mt-1">A melhor pizza na sua porta</p>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Entrar na conta</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                className="input"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handle}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <div className="mt-4 text-center space-y-2">
            <Link to="/forgot-password" className="block text-sm text-brand-500 font-semibold hover:underline">
              Esqueci minha senha
            </Link>
            <p className="text-sm text-gray-500">
              Não tem conta?{' '}
              <Link to="/register" className="text-brand-500 font-semibold hover:underline">
                Criar conta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
