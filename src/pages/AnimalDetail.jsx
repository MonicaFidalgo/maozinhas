import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAnimal } from "../hooks/useAnimals";
import styles from "./AnimalDetail.module.css";

const SIZE_LABEL = { pequeno: "Pequeno", medio: "Médio", grande: "Grande" };

const ADOPTION_FORMS = {
  cao: "https://docs.google.com/forms/d/e/1FAIpQLScSoagqPU8t8HtiL2P1zvhQOeMuOmimizLa4g-eA7msqYJjQg/viewform?usp=pp_url&entry.610170515=",
  gato: "https://docs.google.com/forms/d/e/1FAIpQLSeMmgSK6_EOe2AsPaqIMaZoiFIT4BJK75X2-MR41HJhBl7X-g/viewform?usp=pp_url&entry.1131099540=",
};

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
  const animalArticle = animal.gender === "Femea" ? "a" : "o";
  const adoptionUrl = ADOPTION_FORMS[animal.type]
    ? ADOPTION_FORMS[animal.type] + encodeURIComponent(animal.name)
    : null;

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
                    ? `Nasceu em ${animal.born_year}`
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

            {/* Adoption CTA */}
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
            ) : (
              <div className={styles.adoptCta}>
                <h3>Quero adotar {animalArticle} {animal.name} 🐾</h3>
                <p>
                  Preenche a nossa pré-candidatura — demora cerca de 5 minutos
                  e ajuda-nos a conhecer-te melhor. O nome do {animalTypeLabel} já vai pré-preenchido.
                </p>
                {adoptionUrl ? (
                  <a
                    href={adoptionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.btnSubmit}
                  >
                    Preencher pré-candidatura 💛
                  </a>
                ) : (
                  <a href="/#contacto" className={styles.btnSubmit}>
                    Contacta-nos 💛
                  </a>
                )}
                <p className={styles.formNote}>
                  A Cátia ou outra voluntária entrará em contacto após análise da candidatura.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
