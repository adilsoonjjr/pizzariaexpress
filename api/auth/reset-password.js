import bcrypt from 'bcryptjs'
import { sql } from '../_lib/db.js'
import { cors, signToken } from '../_lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { token, password } = req.body
  if (!token || !password) return res.status(400).json({ error: 'Dados incompletos' })
  if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres' })

  try {
    const rows = await sql`
      SELECT id, name, email, phone, role, address
      FROM profiles
      WHERE reset_token = ${token}
        AND reset_token_expires > NOW()
    `

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Link inválido ou expirado. Solicite um novo.' })
    }

    const user = rows[0]
    const hash = await bcrypt.hash(password, 12)

    await sql`
      UPDATE profiles
      SET password_hash = ${hash},
          reset_token = NULL,
          reset_token_expires = NULL
      WHERE id = ${user.id}
    `

    return res.status(200).json({
      token: signToken({ id: user.id, role: user.role }),
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, address: user.address },
    })
  } catch (err) {
    console.error('reset-password:', err)
    return res.status(500).json({ error: 'Erro ao redefinir senha' })
  }
}
