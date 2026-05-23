import { sql } from '../_lib/db.js'
import { cors, requireAuth, requireAdmin } from '../_lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const user = requireAuth(req, res)
  if (!user) return

  // GET — admin vê todos, cliente vê só os seus
  if (req.method === 'GET') {
    const rows = user.role === 'admin'
      ? await sql`SELECT * FROM orders ORDER BY created_at DESC`
      : await sql`SELECT * FROM orders WHERE customer_id=${user.id} ORDER BY created_at DESC`
    return res.json(rows)
  }

  // POST — criar pedido (cliente)
  if (req.method === 'POST') {
    const d = req.body
    const rows = await sql`
      INSERT INTO orders
        (customer_id, customer_name, customer_phone, delivery_address,
         items, subtotal, delivery_fee, total, payment_method, payment_change,
         status, status_history, estimated_time)
      VALUES
        (${user.id}, ${d.customer_name}, ${d.customer_phone || ''},
         ${JSON.stringify(d.delivery_address)}::jsonb,
         ${JSON.stringify(d.items)}::jsonb,
         ${d.subtotal}, ${d.delivery_fee}, ${d.total},
         ${d.payment_method}, ${d.payment_change ?? null},
         'pending',
         ${JSON.stringify([{ status: 'pending', at: new Date().toISOString() }])}::jsonb,
         ${d.estimated_time ?? 45})
      RETURNING *
    `
    return res.status(201).json(rows[0])
  }

  // PUT — atualizar status (admin)
  if (req.method === 'PUT') {
    const admin = requireAdmin(req, res)
    if (!admin) return
    const { id, status, status_history } = req.body
    const rows = await sql`
      UPDATE orders
      SET status=${status},
          status_history=${JSON.stringify(status_history)}::jsonb,
          updated_at=NOW()
      WHERE id=${id}
      RETURNING *
    `
    return res.json(rows[0])
  }

  res.status(405).end()
}
