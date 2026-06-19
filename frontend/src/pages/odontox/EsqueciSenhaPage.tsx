import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BrandPanel from '@/components/odontox/BrandPanel'
import { Check } from '@/components/odontox/icons'
import { ACCENT } from '@/lib/odontox/constants'

export default function EsqueciSenhaPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || sending) return
    setSending(true)
    // simula o envio do e-mail de recuperação (ambiente de demonstração)
    setTimeout(() => {
      setSending(false)
      setSent(true)
    }, 800)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', background: '#F4F7F8' }}>
      <BrandPanel />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        {!sent ? (
          <form onSubmit={submit} style={{ width: '100%', maxWidth: 380 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', color: '#0F2225' }}>Recuperar senha</h2>
            <p style={{ fontSize: 15, lineHeight: 1.55, color: '#5B6B6E', margin: '0 0 32px' }}>Informe o e-mail cadastrado e enviaremos um link para você redefinir sua senha.</p>

            <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#33484B', marginBottom: 7 }}>E-mail</label>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@clinica.com"
              style={{ width: '100%', padding: '13px 15px', border: '1px solid #DCE5E5', borderRadius: 11, fontSize: 15, background: '#fff', marginBottom: 24, color: '#1B2B2E' }}
            />

            <button
              type="submit"
              disabled={!email.trim() || sending}
              style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: ACCENT, color: '#fff', border: 'none', borderRadius: 11, padding: 14, fontSize: 15.5, fontWeight: 700, cursor: !email.trim() || sending ? 'default' : 'pointer', letterSpacing: '.2px', opacity: !email.trim() || sending ? 0.6 : 1, transition: 'opacity .15s' }}
            >
              {sending ? 'Enviando…' : 'Enviar link de recuperação'}
            </button>

            <p style={{ fontSize: 14, textAlign: 'center', margin: '24px 0 0' }}>
              <Link to="/login" style={{ color: ACCENT, fontWeight: 600, textDecoration: 'none' }}>← Voltar para o login</Link>
            </p>
          </form>
        ) : (
          <div style={{ width: '100%', maxWidth: 380 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(14,122,134,.12)', color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
              <Check size={30} color={ACCENT} />
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', color: '#0F2225' }}>Verifique seu e-mail</h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#5B6B6E', margin: '0 0 8px' }}>
              Se houver uma conta associada a <strong style={{ color: '#1B2B2E' }}>{email}</strong>, você receberá um link para redefinir sua senha em alguns instantes.
            </p>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#94A3A5', margin: '0 0 28px' }}>Não esqueça de checar a caixa de spam. O link expira em 30 minutos.</p>

            <button
              onClick={() => navigate('/login')}
              style={{ width: '100%', background: ACCENT, color: '#fff', border: 'none', borderRadius: 11, padding: 14, fontSize: 15.5, fontWeight: 700, cursor: 'pointer', letterSpacing: '.2px' }}
            >
              Voltar para o login
            </button>

            <p style={{ fontSize: 13.5, textAlign: 'center', margin: '20px 0 0', color: '#5B6B6E' }}>
              Não recebeu?{' '}
              <span onClick={() => setSent(false)} style={{ color: ACCENT, fontWeight: 600, cursor: 'pointer' }}>Reenviar</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
