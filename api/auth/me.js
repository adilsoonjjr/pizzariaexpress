import { sql } from '../_lib/db.js'
import { cors, requireAuth } from '../_lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const user = requireAuth(req, res)
  if (!user) return

  if (req.method === 'GET') {
    const rows = await sql`
      SELECT id, name, email, phone, role, address, created_at
      FROM profiles WHERE id = ${user.id}
    `
    if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado' })
    return res.json(rows[0])
  }

  if (req.method === 'PUT') {
    const { name, phone, address } = req.body
    const rows = await sql`
      UPDATE profiles
      SET name   = COALESCE(${name}, name),
          phone  = COALESCE(${phone}, phone),
          address = COALESCE(${address ? JSON.stringify(address) : null}::jsonb, address)
      WHERE id = ${user.id}
      RETURNING id, name, email, phone, role, address, created_at
    `
    return res.json(rows[0])
  }

  res.status(405).end()
}
