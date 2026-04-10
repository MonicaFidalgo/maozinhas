import styles from "./Apoiar.module.css";

export default function Apoiar() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.tag}>Apoiar</span>
        <h1>Ajuda-nos a continuar</h1>
        <p>
          O abrigo funciona exclusivamente com o apoio de voluntários e doações.
          Cada contribuição faz a diferença na vida dos nossos animais.
        </p>
      </section>

      <section className={styles.section} data-bg="green">
        <h2>Como Doar</h2>

        <div className={styles.card}>
          <h3>Transferência bancária / MBWay</h3>
          <dl className={styles.dl}>
            <dt>NIB</dt>
            <dd>0033 0000 4555 7501 4120 5</dd>
            <dt>IBAN</dt>
            <dd>PT50 0033 0000 4555 7501 4120 5</dd>
            <dt>BIC / SWIFT</dt>
            <dd>BCOMPTPL</dd>
            <dt>MBWay</dt>
            <dd>913 124 611 / 915 223 616</dd>
          </dl>
        </div>

        <div className={styles.card}>
          <h3>Pontos de recolha de donativos</h3>
          <ul className={styles.list}>
            <li>Clínica Veterinária da Moita — Moita</li>
            <li>Clínica Veterinária de Alhos Vedros — Alhos Vedros</li>
            <li>Farmácia Central da Moita — Moita</li>
            <li>Farmácia de Alhos Vedros — Alhos Vedros</li>
            <li>Junta de Freguesia da Moita — Moita</li>
            <li>Junta de Freguesia de Alhos Vedros — Alhos Vedros</li>
            <li>
              Sede dos Voluntários — R. Cândido dos Reis 107, Alhos Vedros
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Loja Solidária</h2>
        <p>
          Temos uma loja solidária no Facebook onde vendemos artigos doados e
          artesanato feito pelos voluntários. Todo o dinheiro reverte a favor
          dos animais do abrigo. Visita a nossa página e ajuda-nos a encontrar
          novos donos para estes artigos — e para os nossos patudos!
        </p>
        <a
          href="https://www.facebook.com/VoluntariosAAAAMoita/"
          target="_blank"
          rel="noreferrer"
          className={styles.cta}
        >
          Ver loja no Facebook
        </a>
      </section>
    </div>
  );
}
