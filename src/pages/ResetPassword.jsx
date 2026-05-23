import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api, token as tokenStorage } from '../lib/api'
import toast from 'react-hot-toast'
import { ChevronLeft, Eye, EyeOff } from 'lucide-react'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resetToken = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!resetToken) navigate('/login')
  }, [resetToken, navigate])

  async function submit(e) {
    e.preventDefault()
    if (password !== confirm) return toast.error('As senhas não coincidem')
    if (password.length < 6) return toast.error('Senha deve ter ao menos 6 caracteres')

    setLoading(true)
    try {
      const { token: tok, user } = await api.post('/auth/reset-password', {
        token: resetToken,
        password,
      })
      tokenStorage.set(tok)
      toast.success('Senha redefinida com sucesso!')
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      toast.error(err.message || 'Link inválido ou expirado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-500 to-brand-700 flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🍕</div>
          <h1 className="text-3xl font-black text-white">PizzaExpress</h1>
        </div>

        <div className="card p-6">
          <Link to="/login" className="flex items-center gap-1 text-gray-400 text-sm mb-4 hover:text-gray-600">
            <ChevronLeft className="w-4 h-4" /> Voltar ao login
          </Link>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Nova senha</h2>
          <p className="text-gray-500 text-sm mb-5">Digite e confirme sua nova senha.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Nova senha</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirmar senha</label>
              <input
                type={show ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input"
                placeholder="Repita a senha"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary mt-2">
              {loading ? 'Salvando...' : 'Redefinir senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
