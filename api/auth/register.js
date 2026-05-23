import bcrypt from 'bcryptjs'
import { sql } from '../_lib/db.js'
import { cors, signToken } from '../_lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, password, phone, adminCode } = req.body

  if (!name || !email || !password) return res.status(400).json({ error: 'Dados incompletos' })
  if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres' })

  try {
    const role = adminCode === process.env.ADMIN_CODE ? 'admin' : 'customer'
    const hash = await bcrypt.hash(password, 12)

    const rows = await sql`
      INSERT INTO profiles (name, email, password_hash, phone, role)
      VALUES (${name}, ${email}, ${hash}, ${phone || ''}, ${role})
      RETURNING id, name, email, phone, role, address, created_at
    `
    const user = rows[0]
    return res.status(201).json({ token: signToken({ id: user.id, role: user.role }), user })
  } catch (err) {
    if (err.message?.includes('unique') || err.code === '23505') {
      return res.status(400).json({ error: 'Email já cadastrado' })
    }
    console.error('register:', err)
    return res.status(500).json({ error: 'Erro ao criar conta' })
  }
}
