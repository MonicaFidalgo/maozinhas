import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../App";
import { supabase } from "../lib/supabase";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo} onClick={closeMenu}>
        <img
          src="/maozinhas-logo.png"
          alt="Mãozinhas"
          className={styles.logoImg}
        />
      </Link>

      <ul className={styles.links}>
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Patudos
          </NavLink>
        </li>
        <li>
          <a href="/#como-adotar">Como Adotar</a>
        </li>
        <li>
          <NavLink
            to="/apoiar"
            className={({ isActive }) => (isActive ? styles.active : "")}
          >
            Apoiar
          </NavLink>
        </li>
        <li>
          <a href="/#contacto">Contacto</a>
        </li>
      </ul>

      <div className={styles.actions}>
        {session ? (
          <>
            <Link to="/admin" className={styles.adminBtn}>
              {profile?.role === "admin" ? "⚙️ Admin" : "✏️ Painel"}
            </Link>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Sair
            </button>
          </>
        ) : (
          <Link to="/admin/login" className={styles.loginBtn}>
            Entrar
          </Link>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={menuOpen}
      >
        <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ""}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ""}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ""}`} />
      </button>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <NavLink to="/" end onClick={closeMenu} className={({ isActive }) => isActive ? styles.mobileActive : ""}>Patudos</NavLink>
          <a href="/#como-adotar" onClick={closeMenu}>Como Adotar</a>
          <NavLink to="/apoiar" onClick={closeMenu} className={({ isActive }) => isActive ? styles.mobileActive : ""}>Apoiar</NavLink>
          <a href="/#contacto" onClick={closeMenu}>Contacto</a>
          {session ? (
            <>
              <Link to="/admin" onClick={closeMenu} className={styles.mobileAdmin}>
                {profile?.role === "admin" ? "⚙️ Admin" : "✏️ Painel"}
              </Link>
              <button onClick={() => { handleLogout(); closeMenu(); }} className={styles.mobileLogout}>
                Sair
              </button>
            </>
          ) : (
            <Link to="/admin/login" onClick={closeMenu} className={styles.mobileLogin}>
              Entrar
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
