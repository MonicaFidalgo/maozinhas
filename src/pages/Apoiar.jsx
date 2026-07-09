import { useState } from "react";
import styles from "./Apoiar.module.css";
import IconCopy from "../components/icons/IconCopy";
import IconCheck from "../components/icons/IconCheck";

export default function Apoiar() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText("PT50003300004555750141205");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
            <dd className={styles.ibanRow}>
              PT50 0033 0000 4555 7501 4120 5
              <button onClick={handleCopy} className={styles.copyBtn} title="Copiar IBAN" aria-label="Copiar IBAN">
                {copied ? <IconCheck /> : <IconCopy />}
              </button>
            </dd>
            <dt>BIC / SWIFT</dt>
            <dd>BCOMPTPL</dd>
            <dt>MBWay</dt>
            <dd>913 124 611 / 915 223 616</dd>
          </dl>
        </div>

        <div className={styles.card}>
          <h3>Pontos de recolha de donativos</h3>
          <ul className={styles.list}>
            <li><strong>Clínica veterinária BBVET</strong> (Rua 26 de Janeiro, nº66, Baixa da Banheira)</li>
            <li><strong>Hospital Veterinário Sul do Tejo</strong> (Rua Manuel Vasques, Lj. 10 A-B, 2830-535 Santo André, Barreiro)</li>
            <li><strong>Clínica Vip Pets Lowcost Barreiro</strong> (R. Dr. Manuel Pacheco Nobre 17, 2830-080 Barreiro)</li>
            <li><strong>Churrasqueira Galináceo</strong> (R. Diogo Cão nr 7, 2830-082 Barreiro)</li>
            <li><strong>PetsGoZen</strong> (Estrada Municipal 510 9B, 2835-490 Santo António da Charneca)</li>
            <li><strong>3 corações e 1/2 - Snack-Bar</strong> (Urbanização, Escavadeira, Praceta João Azevedo 2, 2830-527 Barreiro)</li>
            <li><strong>Tons de Café</strong> (Rua Calouste Gulbenkian N°109, 2830-046 Barreiro)</li>
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
          href="https://www.facebook.com/Lojasolidariaaaamoita"
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
