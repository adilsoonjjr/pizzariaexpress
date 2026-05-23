import bcrypt from 'bcryptjs'
import { sql } from '../_lib/db.js'
import { cors, signToken } from '../_lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body

  try {
    const rows = await sql`SELECT * FROM profiles WHERE email = ${email}`
    if (!rows.length) return res.status(401).json({ error: 'Email ou senha incorretos' })

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Email ou senha incorretos' })

    const { password_hash, ...safe } = user
    return res.json({ token: signToken({ id: user.id, role: user.role }), user: safe })
  } catch (err) {
    console.error('login:', err)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
