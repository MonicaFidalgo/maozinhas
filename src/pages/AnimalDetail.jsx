import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAnimal } from "../hooks/useAnimals";
import { supabase } from "../lib/supabase";
import styles from "./AnimalDetail.module.css";

const SIZE_LABEL = { pequeno: "Pequeno", medio: "Médio", grande: "Grande" };

function getImages(animal) {
  const imgs = [];
  if (animal.images?.length) imgs.push(...animal.images);
  if (animal.wix_img_url && !imgs.includes(animal.wix_img_url))
    imgs.push(animal.wix_img_url);
  return imgs;
}

export default function AnimalDetail() {
  const { slug } = useParams();
  const { animal, loading, error } = useAnimal(slug);
  const [activeImg, setActiveImg] = useState(0);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  if (loading) return <div className={styles.loading}>A carregar…</div>;
  if (error || !animal)
    return (
      <div className={styles.notFound}>
        <h2>Animal não encontrado</h2>
        <Link to="/">← Voltar aos patudos</Link>
      </div>
    );

  const images = getImages(animal);
  const animalTypeLabel = animal.type === "cao" ? "cão" : "gato";
  const animalGenderLabel = animal.gender === "Femea" ? "fêmea" : "macho";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      setFormError("Por favor preenche o nome, telemóvel e email.");
      return;
    }
    setSending(true);
    setFormError("");
    const { error } = await supabase.from("adoption_requests").insert({
      animal_id: animal.id,
      animal_name: animal.name,
      ...form,
    });
    setSending(false);
    if (error) {
      setFormError(
        "Erro ao enviar. Tenta novamente ou contacta-nos pelo telemóvel.",
      );
    } else {
      setSent(true);
    }
  }

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{animal.name} — Abrigo Mãozinhas</title>
        <meta name="description" content={`Adopta o ${animal.name}, ${animalTypeLabel} ${animalGenderLabel} no Abrigo Mãozinhas, Alhos Vedros.`} />
        <meta property="og:title" content={`${animal.name} — Abrigo Mãozinhas`} />
        <meta property="og:description" content={animal.description?.slice(0, 160) || ''} />
        <meta property="og:image" content={animal.images?.[0] || ''} />
        <meta property="og:url" content={`https://maozinhas.pages.dev/animal/${animal.slug}`} />
      </Helmet>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">Início</Link>
          <span>›</span>
          <Link to="/">Todos os Patudos</Link>
          <span>›</span>
          {animal.type && (
            <>
              <Link to={`/?type=${animal.type}`}>
                {animal.type === "cao" ? "🐶 Cão" : "🐱 Gato"}
              </Link>
              <span>›</span>
            </>
          )}
          <span>{animal.name}</span>
        </nav>

        <div className={styles.layout}>
          {/* LEFT: Images */}
          <div className={styles.gallery}>
            <div className={styles.mainImg}>
              {images.length > 0 ? (
                <img src={images[activeImg]} alt={animal.name} />
              ) : (
                <div className={styles.noImg}>🐾</div>
              )}
              {animal.status !== "disponivel" && (
                <div className={styles.statusBanner}>
                  {animal.status === "adotado" ? "✅ Adotado" : "🔒 Reservado"}
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className={styles.thumbs}>
                {images.map((src, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ""}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={src} alt={`${animal.name} foto ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Info + Form */}
          <div className={styles.info}>
            <h1 className={styles.name}>{animal.name}</h1>

            <div className={styles.tags}>
              {animal.born_year && (
                <span className={styles.tag}>
                  {animal.born_year !== "Indeterminada"
                    ? `Nascido em ${animal.born_year}`
                    : "Ano indeterminado"}
                </span>
              )}
              {animal.type && (
                <span className={styles.tag}>
                  {animal.type === "cao" ? "🐶 Cão" : "🐱 Gato"}
                </span>
              )}
              {animal.gender && (
                <span className={styles.tag}>
                  {animal.gender === "Femea" ? "Fêmea" : "Macho"}
                </span>
              )}
              {animal.size && animal.type !== "gato" && (
                <span className={styles.tag}>{SIZE_LABEL[animal.size]}</span>
              )}
              {animal.type === "gato" && animal.fiv && (
                <span
                  className={`${styles.tag} ${styles["fiv_" + animal.fiv]}`}
                >
                  FIV {animal.fiv === "positivo" ? "+" : "−"}
                </span>
              )}
            </div>

            {animal.description && (
              <p className={styles.desc}>{animal.description}</p>
            )}

            <hr className={styles.divider} />

            {/* Adoption Form */}
            {animal.status !== "disponivel" ? (
              <div className={styles.unavailable}>
                <p>
                  Este animal já foi{" "}
                  {animal.status === "adotado" ? "adotado" : "reservado"}. 🎉
                </p>
                <Link to="/" className={styles.btnBack}>
                  Ver outros patudos
                </Link>
              </div>
            ) : sent ? (
              <div className={styles.success}>
                <span>💛</span>
                <h3>Pedido enviado!</h3>
                <p>
                  Obrigada pelo interesse no {animal.name}! A Cátia ou outra
                  voluntária entrará em contacto brevemente.
                </p>
                <Link to="/">← Ver mais patudos</Link>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <h3>Quero adotar o {animal.name} 🐾</h3>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Nome *</label>
                    <input
                      type="text"
                      placeholder="O teu nome completo"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Telemóvel *</label>
                    <input
                      type="tel"
                      placeholder="9XX XXX XXX"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phone: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Email *</label>
                  <input
                    type="email"
                    placeholder="o.teu@email.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>
                    Mensagem{" "}
                    <span style={{ fontWeight: 400, color: "var(--mid)" }}>
                      (opcional)
                    </span>
                  </label>
                  <textarea
                    placeholder="Conta-nos um pouco sobre ti, a tua casa, outros animais…"
                    rows={3}
                    value={form.message}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, message: e.target.value }))
                    }
                  />
                </div>
                {formError && <p className={styles.formError}>{formError}</p>}
                <button
                  type="submit"
                  className={styles.btnSubmit}
                  disabled={sending}
                >
                  {sending ? "A enviar…" : "Enviar pedido de adoção 💛"}
                </button>
                <p className={styles.formNote}>
                  A Cátia ou outra voluntária entrará em contacto contigo em
                  breve.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
