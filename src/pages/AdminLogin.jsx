import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Email ou password incorretos.')
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.paw}>🐾</span>
          <h1>Painel de Voluntárias</h1>
          <p>Área restrita. Acesso apenas para as voluntárias do Abrigo Mãozinhas.</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.group}>
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="o.teu@email.com" required autoFocus />
          </div>
          <div className={styles.group}>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" required />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} className={styles.btn}>
            {loading ? 'A entrar…' : 'Entrar'}
          </button>
        </form>

        <p className={styles.note}>
          Não tens conta? Fala com a Mónica para criar o teu acesso.
        </p>
      </div>
    </div>
  )
}
