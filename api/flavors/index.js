import { sql } from '../_lib/db.js'
import { cors, requireAuth, requireAdmin } from '../_lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  // GET — qualquer usuário autenticado
  if (req.method === 'GET') {
    const user = requireAuth(req, res)
    if (!user) return
    const rows = await sql`SELECT * FROM flavors ORDER BY category, name`
    return res.json(rows)
  }

  // POST — adicionar sabor (admin)
  if (req.method === 'POST') {
    const user = requireAdmin(req, res)
    if (!user) return
    const { name, description, price, category, emoji, available } = req.body
    const rows = await sql`
      INSERT INTO flavors (name, description, price, category, emoji, available)
      VALUES (${name}, ${description || ''}, ${price}, ${category}, ${emoji || '🍕'}, ${available ?? true})
      RETURNING *
    `
    return res.status(201).json(rows[0])
  }

  // PUT — editar sabor (admin)
  if (req.method === 'PUT') {
    const user = requireAdmin(req, res)
    if (!user) return
    const { id, name, description, price, category, emoji, available } = req.body
    const rows = await sql`
      UPDATE flavors
      SET name=${name}, description=${description}, price=${price},
          category=${category}, emoji=${emoji}, available=${available}
      WHERE id=${id}
      RETURNING *
    `
    return res.json(rows[0])
  }

  // DELETE — excluir sabor (admin)
  if (req.method === 'DELETE') {
    const user = requireAdmin(req, res)
    if (!user) return
    const { id } = req.query
    await sql`DELETE FROM flavors WHERE id=${id}`
    return res.status(204).end()
  }

  res.status(405).end()
}
