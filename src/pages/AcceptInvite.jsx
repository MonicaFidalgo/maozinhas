import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './AdminLogin.module.css'

export default function AcceptInvite() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [ready, setReady]         = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', ''))
    const type = params.get('type')
    const token = params.get('access_token')

    if ((type === 'invite' || type === 'recovery') && token) {
      setReady(true)
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setReady(true)
        } else {
          setError('Link inválido ou expirado.')
        }
      })
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) {
      setError('As passwords não coincidem.')
      return
    }
    if (password.length < 6) {
      setError('A password deve ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError('Erro ao definir password: ' + error.message)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.paw}>🐾</span>
          <h1>Definir Password</h1>
          <p>Bem-vinda ao Abrigo Mãozinhas. Define a tua password para activar a conta.</p>
        </div>

        {ready ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.group}>
              <label>Nova password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoFocus
              />
            </div>
            <div className={styles.group}>
              <label>Confirmar password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={loading} className={styles.btn}>
              {loading ? 'A guardar…' : 'Activar conta'}
            </button>
          </form>
        ) : (
          <p className={styles.error} style={{ textAlign: 'center', padding: '1rem 0' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
