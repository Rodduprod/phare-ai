export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Convertit un tag en slug d'URL propre (ASCII, sans accents ni espaces).
 * Ex: "IA embarquée" → "ia-embarquee". Évite les %20/accents dans les URLs de tags.
 */
export function slugifyTag(tag: string): string {
  // NFD décompose les lettres accentuées en lettre + marque combinante (0x0300–0x036f),
  // qu'on retire par code de caractère (compatible ES2017, sans regex unicode).
  const withoutAccents = tag
    .normalize("NFD")
    .split("")
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code < 0x0300 || code > 0x036f;
    })
    .join("");

  return withoutAccents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // tout caractère non alphanumérique → tiret
    .replace(/^-+|-+$/g, ""); // pas de tiret en début/fin
}
