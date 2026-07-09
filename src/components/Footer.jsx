import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.brandName}>🐾 Abrigo Mãozinhas</span>
          <p>
            Voluntários apaixonados a lutar todos os dias para dar uma segunda
            oportunidade aos animais abandonados da Moita e arredores.
          </p>
        </div>
        <div>
          <h4>Contacto</h4>
          <ul>
            <li>R. Cândido dos Reis 107</li>
            <li>2860 Alhos Vedros, Moita</li>
            <li>📞 913 124 611</li>
            <li>
              <a href="mailto:adoptarnamoita@gmail.com">
                adoptarnamoita@gmail.com
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4>Links</h4>
          <ul>
            <li>
              <a href="/#patudos">Adotar um animal</a>
            </li>
            <li>
              <a href="/#como-adotar">Como adotar</a>
            </li>
            <li>
              <a href="/apoiar">Apoiar o abrigo</a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/abrigo_maozinhas/"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/VoluntariosAAAAMoita/"
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>
          © 2019–{new Date().getFullYear()} Voluntários do Abrigo da Mãozinhas ·
          Todos os direitos reservados
        </span>
        <span className={styles.credit}>
          feito com <span className={styles.heart}>♥</span> por{" "}
          <a href="https://monicafidalgo.dev/" target="_blank" rel="noreferrer">
            Mónica Fidalgo
          </a>
        </span>
      </div>
    </footer>
  );
}
