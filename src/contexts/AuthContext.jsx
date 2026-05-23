import { createContext, useContext, useEffect, useState } from 'react'
import { api, token } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token.get()) { setLoading(false); return }
    api.get('/auth/me')
      .then((data) => { setUser({ id: data.id }); setProfile(data) })
      .catch(() => token.set(null))
      .finally(() => setLoading(false))
  }, [])

  async function register({ name, email, password, phone, adminCode }) {
    const { token: tok, user: u } = await api.post('/auth/register', { name, email, password, phone, adminCode })
    token.set(tok)
    setUser({ id: u.id })
    setProfile(u)
    return u.role
  }

  async function login(email, password) {
    const { token: tok, user: u } = await api.post('/auth/login', { email, password })
    token.set(tok)
    setUser({ id: u.id })
    setProfile(u)
    return u.role
  }

  async function logout() {
    token.set(null)
    setUser(null)
    setProfile(null)
  }

  async function updateProfile(updates) {
    const updated = await api.put('/auth/me', updates)
    setProfile((p) => ({ ...p, ...updated }))
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
