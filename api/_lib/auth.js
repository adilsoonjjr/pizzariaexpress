import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type')
}

export function verifyToken(req) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  try {
    return jwt.verify(header.slice(7), SECRET)
  } catch {
    return null
  }
}

export function requireAuth(req, res) {
  const payload = verifyToken(req)
  if (!payload) { res.status(401).json({ error: 'Não autenticado' }); return null }
  return payload
}

export function requireAdmin(req, res) {
  const payload = verifyToken(req)
  if (!payload) { res.status(401).json({ error: 'Não autenticado' }); return null }
  if (payload.role !== 'admin') { res.status(403).json({ error: 'Acesso negado' }); return null }
  return payload
}

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' })
}
