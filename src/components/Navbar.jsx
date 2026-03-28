import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import { supabase } from '../lib/supabase'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { session, profile } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoPaw}>🐾</span>
        <strong>Abrigo Mãozinhas</strong>
      </Link>

      <ul className={styles.links}>
        <li><NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>Patudos</NavLink></li>
        <li><a href="/#como-adotar">Como Adotar</a></li>
        <li><a href="/#sobre">Sobre</a></li>
        <li><a href="/#contacto">Contacto</a></li>
      </ul>

      <div className={styles.actions}>
        {session ? (
          <>
            <Link to="/admin" className={styles.adminBtn}>
              {profile?.role === 'admin' ? '⚙️ Admin' : '✏️ Painel'}
            </Link>
            <button onClick={handleLogout} className={styles.logoutBtn}>Sair</button>
          </>
        ) : null}
      </div>
    </nav>
  )
}
