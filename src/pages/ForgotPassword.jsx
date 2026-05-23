import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import toast from 'react-hot-toast'
import { ChevronLeft, Mail } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      toast.error('Erro ao enviar email. Tente novamente.')
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
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Email enviado!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Se este email estiver cadastrado, você receberá um link para redefinir sua senha em breve.
                Verifique também a caixa de spam.
              </p>
              <Link to="/login" className="btn-primary block text-center py-3">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-1 text-gray-400 text-sm mb-4 hover:text-gray-600">
                <ChevronLeft className="w-4 h-4" /> Voltar
              </Link>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Esqueci minha senha</h2>
              <p className="text-gray-500 text-sm mb-5">
                Digite seu email e enviaremos um link para redefinir sua senha.
              </p>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary mt-2">
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
