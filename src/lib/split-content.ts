/**
 * Coupe le contenu MDX en deux parties à la limite de paragraphe
 * la plus proche de la fraction cible (par défaut 55%).
 *
 * Règles :
 * - On ne coupe jamais à l'intérieur d'un bloc de code (``` ... ```)
 * - On coupe uniquement sur une ligne vide séparant deux blocs
 * - Si l'article est trop court (< MIN_CHARS) on ne coupe pas (retourne [content, ''])
 */

const MIN_CHARS = 1500; // en dessous, pas de CTA mid-article
const TARGET_FRACTION = 0.55; // légèrement après la moitié

export function splitContentAtMidpoint(content: string): [string, string] {
  if (content.length < MIN_CHARS) return [content, ""];

  const target = Math.floor(content.length * TARGET_FRACTION);

  // Repère les plages à l'intérieur de blocs de code (``` ... ```)
  const codeRanges: [number, number][] = [];
  const codePattern = /```[\s\S]*?```/g;
  let m: RegExpExecArray | null;
  while ((m = codePattern.exec(content)) !== null) {
    codeRanges.push([m.index, m.index + m[0].length]);
  }

  const isInCode = (pos: number) =>
    codeRanges.some(([start, end]) => pos >= start && pos < end);

  // Cherche toutes les positions de séparation de paragraphes (\n\n)
  const separators: number[] = [];
  let i = 0;
  while (i < content.length - 1) {
    if (content[i] === "\n" && content[i + 1] === "\n" && !isInCode(i)) {
      separators.push(i);
      i += 2;
    } else {
      i++;
    }
  }

  if (separators.length === 0) return [content, ""];

  // Trouve le séparateur le plus proche de la cible
  const best = separators.reduce((prev, cur) =>
    Math.abs(cur - target) < Math.abs(prev - target) ? cur : prev
  );

  // S'assure qu'on ne coupe pas au tout début ou à la toute fin
  if (best < content.length * 0.2 || best > content.length * 0.8) {
    // Fallback : prendre le séparateur le plus proche de 50%
    const fallbackTarget = Math.floor(content.length * 0.5);
    const fallback = separators.reduce((prev, cur) =>
      Math.abs(cur - fallbackTarget) < Math.abs(prev - fallbackTarget) ? cur : prev
    );
    return [content.slice(0, fallback).trimEnd(), content.slice(fallback).trimStart()];
  }

  return [content.slice(0, best).trimEnd(), content.slice(best).trimStart()];
}
