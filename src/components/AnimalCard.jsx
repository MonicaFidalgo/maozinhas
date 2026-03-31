import { Link } from "react-router-dom";
import styles from "./AnimalCard.module.css";

const SIZE_LABEL = { pequeno: "Pequeno", medio: "Médio", grande: "Grande" };
const SIZE_CLASS = {
  pequeno: styles.sizeSmall,
  medio: styles.sizeMedium,
  grande: styles.sizeLarge,
};

function getImageSrc(animal) {
  if (animal.images && animal.images.length > 0) return animal.images[0];
  if (animal.wix_img_url) return animal.wix_img_url;
  return null;
}

export default function AnimalCard({ animal }) {
  const imgSrc = getImageSrc(animal);
  const typeLabel =
    animal.type === "cao" ? "Cão" : animal.type === "gato" ? "Gato" : "—";

  return (
    <article className={styles.card}>
      <Link to={`/animal/${animal.slug}`} className={styles.imageWrap}>
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={animal.name}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={styles.placeholder}
          style={{ display: imgSrc ? "none" : "flex" }}
        >
          🐾
        </div>
        <div className={styles.badges}>
          {animal.born_year && (
            <span className={styles.badgeYear}>
              {animal.born_year === "Indeterminada"
                ? "Indeterminado"
                : animal.born_year}
            </span>
          )}
        </div>
      </Link>

      <div className={styles.body}>
        <Link to={`/animal/${animal.slug}`}>
          <h3 className={styles.name}>{animal.name}</h3>
        </Link>
        <p className={styles.meta}>
          <span>{typeLabel}</span>
          {animal.gender && (
            <span>{animal.gender === "Femea" ? "Fêmea" : "Macho"}</span>
          )}
          {animal.born_year && animal.born_year !== "Indeterminada" && (
            <span>
              {new Date().getFullYear() - parseInt(animal.born_year)} anos
            </span>
          )}
        </p>
        {animal.description && (
          <p className={styles.desc}>{animal.description}</p>
        )}
      </div>

      <div className={styles.footer}>
        <Link to={`/animal/${animal.slug}`} className={styles.btnAdopt}>
          🐾 Quero adotar
        </Link>
        <Link to={`/animal/${animal.slug}`} className={styles.btnMore}>
          Saber mais →
        </Link>
      </div>
    </article>
  );
}
