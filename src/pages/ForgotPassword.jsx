import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './AdminLogin.module.css'

export default function ForgotPassword() {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)
  const [error, setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/accept-invite',
    })
    setLoading(false)
    if (error) {
      setError('Erro ao enviar email: ' + error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.paw}>🐾</span>
          <h1>Recuperar Password</h1>
          <p>Indica o teu email e enviamos um link para definires uma nova password.</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ fontSize: '.9rem', marginBottom: '1.25rem' }}>
              Email enviado! Verifica a tua caixa de entrada e clica no link.
            </p>
            <Link to="/admin/login" className={styles.forgotLink}>
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.group}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="o.teu@email.com"
                required
                autoFocus
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={loading} className={styles.btn}>
              {loading ? 'A enviar…' : 'Enviar link'}
            </button>
            <Link to="/admin/login" className={styles.forgotLink} style={{ textAlign: 'center' }}>
              Voltar ao login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
