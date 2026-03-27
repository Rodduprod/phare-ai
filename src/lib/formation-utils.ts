/**
 * Utilitaires formation — client-safe (pas d'import fs/gray-matter)
 * Importable depuis les Client Components.
 */

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

export const LEVEL_COLORS: Record<string, string> = {
  débutant: "bg-green-100 text-green-800",
  amateur: "bg-blue-100 text-blue-800",
  confirmé: "bg-purple-100 text-purple-800",
};
