import { useState, useCallback, useEffect } from "react";
import { useAnimals } from "../hooks/useAnimals";
import { useSearchParams, useLocation } from "react-router-dom";
import AnimalCard from "../components/AnimalCard";
import styles from "./Home.module.css";


const TYPE_OPTIONS = [
  { val: "todos", label: "Todos" },
  { val: "cao", label: "🐶 Cão" },
  { val: "gato", label: "🐱 Gato" },
];
const SIZE_OPTIONS = [
  { val: "todos", label: "Todos" },
  { val: "pequeno", label: "Pequeno" },
  { val: "medio", label: "Médio" },
  { val: "grande", label: "Grande" },
];
const FIV_OPTIONS = [
  { val: "todos", label: "Todos" },
  { val: "negativo", label: "FIV −" },
  { val: "positivo", label: "FIV +" },
];

export default function Home() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [type, setType] = useState(searchParams.get("type") || "todos");
  const [size, setSize] = useState("todos");
  const [fiv, setFiv] = useState("todos");
  const [search, setSearch] = useState("");
  const [inputVal, setInputVal] = useState("");

  // Sync with URL param changes (e.g. coming from breadcrumb)
  useEffect(() => {
    const t = searchParams.get("type");
    if (t) {
      setType(t);
      setSize("todos");
      setFiv("todos");
    }
  }, [searchParams]);

  const filters = { type, size, fiv, search };
  const { animals, loading } = useAnimals(filters);

  useEffect(() => {
    if (!location.hash || loading) return;
    const id = location.hash.replace("#", "");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: "smooth" });
        }
      });
    });
  }, [location.hash, loading]);

  const handleSearch = useCallback((e) => {
    setInputVal(e.target.value);
    const v = e.target.value;
    const timeout = setTimeout(() => setSearch(v), 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>🏡 Moita, Setúbal · Desde 2019</span>
          <h1>
            Dá-lhe uma casa,
            <br />
            <em>dá-lhe tudo.</em>
          </h1>
          <p>
            Mais de 100 patudos esperam por um lar cheio de amor em Alhos
            Vedros. Cada um tem uma história. Qual será a tua?
          </p>
          <div className={styles.heroActions}>
            <a href="#patudos" className={styles.btnPrimary}>
              🐶 Ver os Patudos
            </a>
            <a href="#como-adotar" className={styles.btnSecondary}>
              Como funciona →
            </a>
          </div>
        </div>
        <div className={styles.heroImage}>
          <img src="/mascote.jpg" alt="Mascote do Abrigo Mãozinhas" />
        </div>
      </section>

      {/* ── STATS ── */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statNum}>104</span>
          <span className={styles.statLabel}>Animais à espera</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>237</span>
          <span className={styles.statLabel}>Adotados em 2024</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>100%</span>
          <span className={styles.statLabel}>Voluntários</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>5+</span>
          <span className={styles.statLabel}>Anos de missão</span>
        </div>
      </div>

      {/* ── VÍDEO ── */}
      <section className={styles.videoSection}>
        <div className={styles.main}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>O Nosso Abrigo</span>
            <h2>Conhece o Abrigo Mãozinhas</h2>
            <p>Um espaço cheio de amor gerido inteiramente por voluntárias em Alhos Vedros.</p>
          </div>
          <div className={styles.videoWrapper}>
            <iframe
              src="https://www.youtube.com/embed/p6rUavn5iTA"
              title="Abrigo Mãozinhas"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ── PATUDOS ── */}
      <main className={styles.main} id="patudos">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Os Nossos Patudos</span>
          <h2>Encontra o teu companheiro</h2>
          <p>
            Cada um tem uma personalidade única. Filtra por tipo
            {type !== "gato" ? ", tamanho" : ""} ou pesquisa por nome.
          </p>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Tipo</span>
            {TYPE_OPTIONS.map((o) => (
              <button
                key={o.val}
                className={`${styles.pill} ${type === o.val ? styles.pillActive : ""}`}
                onClick={() => {
                  setType(o.val);
                  if (o.val === "gato") setSize("todos");
                  if (o.val !== "gato") setFiv("todos");
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
          {type !== "gato" && (
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Tamanho</span>
              {SIZE_OPTIONS.map((o) => (
                <button
                  key={o.val}
                  className={`${styles.pill} ${size === o.val ? styles.pillActive : ""}`}
                  onClick={() => setSize(o.val)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
          {type === "gato" && (
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>FIV</span>
              {FIV_OPTIONS.map((o) => (
                <button
                  key={o.val}
                  className={`${styles.pill} ${fiv === o.val ? styles.pillActive : ""}`}
                  onClick={() => setFiv(o.val)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
          <div className={styles.searchBox}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={inputVal}
              onChange={handleSearch}
              placeholder="Buscar por nome…"
            />
          </div>
        </div>

        <p className={styles.countLabel}>
          {loading
            ? "A carregar…"
            : `${animals.length} patudo${animals.length !== 1 ? "s" : ""} disponíve${animals.length !== 1 ? "is" : "l"}`}
        </p>

        {loading ? (
          <div className={styles.loadingGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : animals.length === 0 ? (
          <div className={styles.empty}>
            <span>😔</span>
            <p>Nenhum patudo encontrado com esses filtros.</p>
            <button
              onClick={() => {
                setType("todos");
                setSize("todos");
                setFiv("todos");
                setSearch("");
                setInputVal("");
              }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {animals.map((a) => (
              <AnimalCard key={a.id} animal={a} />
            ))}
          </div>
        )}
      </main>

      {/* ── HOW TO ADOPT ── */}
      <section className={styles.howSection} id="como-adotar">
        <div className={styles.main}>
          <div className={styles.sectionHeader}>
            <span
              className={styles.sectionTag}
              style={{ color: "var(--green)" }}
            >
              Processo de Adoção
            </span>
            <h2 style={{ color: "var(--green)" }}>Simples e transparente</h2>
            <p style={{ color: "#3A5835" }}>
              Adotar é uma decisão para a vida. Estamos aqui em cada passo.
            </p>
          </div>
          <div className={styles.steps}>
            {[
              {
                n: "1",
                title: "Conhece o patudo",
                text: "Navega nas fichas e escolhe aquele que tocou no teu coração. Podes vir ao abrigo visitar pessoalmente.",
              },
              {
                n: "2",
                title: "Preenche o formulário",
                text: "Envias-nos uma mensagem de interesse. Queremos conhecer-te e saber que lar vais proporcionar.",
              },
              {
                n: "3",
                title: "Entrevista e visita",
                text: "Os voluntários fazem uma breve entrevista e podem visitar a tua casa para garantir que é um ambiente seguro.",
              },
              {
                n: "4",
                title: "Vai para casa! 🏡",
                text: "Depois de aprovada a adoção, o teu novo companheiro vai finalmente para o lar que merece. Para sempre.",
              },
            ].map((s) => (
              <div key={s.n} className={styles.step}>
                <div className={styles.stepNum}>{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE / CONTACTO ── */}
      <section className={styles.main} style={{ paddingBottom: "1rem" }}>
        <div className={styles.contactGrid} id="contacto">
          <div className={styles.contactCard}>
            <h3>📍 Onde estamos</h3>
            <p>
              R. Cândido dos Reis 107
              <br />
              2860 Alhos Vedros, Moita
              <br />
              Portugal
            </p>
          </div>
          <div className={styles.contactCard}>
            <h3>📞 Fala connosco</h3>
            <p>
              Cátia Sousa (voluntária)
              <br />
              <a href="tel:913124611">913 124 611</a>
              <br />
              <small>
                Por motivo profissional, nem sempre é possível atender. Deixa
                mensagem.
              </small>
            </p>
          </div>
          <div className={styles.contactCard}>
            <h3>🌐 Redes sociais</h3>
            <p>
              <a
                href="https://www.instagram.com/abrigo_maozinhas/"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
              <br />
              <a
                href="https://www.facebook.com/VoluntariosAAAAMoita/"
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
              <br />
              <a
                href="https://www.youtube.com/@aaaamoitaassociacaodosamig1273"
                target="_blank"
                rel="noreferrer"
              >
                YouTube
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
