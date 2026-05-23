import crypto from 'crypto'
import { Resend } from 'resend'
import { sql } from '../_lib/db.js'
import { cors } from '../_lib/auth.js'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email obrigatório' })

  try {
    const rows = await sql`SELECT id, name FROM profiles WHERE email = ${email}`
    // Sempre retorna sucesso para não revelar se o email existe
    if (rows.length === 0) {
      return res.status(200).json({ ok: true })
    }

    const user = rows[0]
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hora

    await sql`
      UPDATE profiles
      SET reset_token = ${token}, reset_token_expires = ${expires.toISOString()}
      WHERE id = ${user.id}
    `

    const appUrl = process.env.APP_URL || 'https://pizzariaexpress.vercel.app'
    const link = `${appUrl}/reset-password?token=${token}`

    await resend.emails.send({
      from: 'PizzaExpress <noreply@pizzariaexpress.vercel.app>',
      to: email,
      subject: 'Redefinir sua senha — PizzaExpress',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="font-size:48px;">🍕</span>
            <h1 style="color:#e63020;margin:8px 0 4px;font-size:24px;">PizzaExpress</h1>
          </div>
          <h2 style="color:#111;font-size:18px;margin-bottom:8px;">Redefinir senha</h2>
          <p style="color:#555;margin-bottom:24px;">
            Olá, <strong>${user.name}</strong>!<br/>
            Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo:
          </p>
          <a href="${link}"
            style="display:block;text-align:center;background:#e63020;color:#fff;padding:14px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;">
            Redefinir minha senha
          </a>
          <p style="color:#999;font-size:12px;margin-top:24px;text-align:center;">
            Este link expira em <strong>1 hora</strong>.<br/>
            Se você não solicitou, ignore este email.
          </p>
        </div>
      `,
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('forgot-password:', err)
    return res.status(500).json({ error: 'Erro ao enviar email' })
  }
}
