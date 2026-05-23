import { sql } from '../_lib/db.js'
import { cors, requireAuth, requireAdmin } from '../_lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const user = requireAuth(req, res)
  if (!user) return

  // GET ?key=pricing  ou  GET (todos)
  if (req.method === 'GET') {
    const { key } = req.query
    if (key) {
      const rows = await sql`SELECT value FROM settings WHERE key=${key}`
      return res.json(rows[0]?.value ?? null)
    }
    const rows = await sql`SELECT * FROM settings`
    return res.json(rows)
  }

  // PUT — salvar configuração (admin)
  if (req.method === 'PUT') {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const { key, value } = req.body
    await sql`
      INSERT INTO settings (key, value) VALUES (${key}, ${JSON.stringify(value)}::jsonb)
      ON CONFLICT (key) DO UPDATE SET value=${JSON.stringify(value)}::jsonb, updated_at=NOW()
    `
    return res.json({ ok: true })
  }

  res.status(405).end()
}
