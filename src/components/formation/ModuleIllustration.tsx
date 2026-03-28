/**
 * Illustration SVG/CSS pour les cards de module de formation.
 * Remplace les photos Unsplash — gradient bleu + motif + icône par module.
 */

interface ModuleConfig {
  gradient: string;   // classes Tailwind pour le fond
  icon: string;       // emoji principal
  pattern: "dots" | "grid" | "lines" | "circles";
  accent: string;     // couleur du pattern overlay (hex, opacité gérée inline)
}

const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  "comprendre-ia-debutant": {
    gradient: "from-sky-400 via-blue-500 to-blue-700",
    icon: "🧠",
    pattern: "dots",
    accent: "#ffffff",
  },
  "ia-au-travail-amateur": {
    gradient: "from-blue-500 via-blue-600 to-indigo-800",
    icon: "⚡",
    pattern: "grid",
    accent: "#ffffff",
  },
  "creer-avec-ia-debutant": {
    gradient: "from-cyan-400 via-sky-500 to-blue-600",
    icon: "✨",
    pattern: "circles",
    accent: "#ffffff",
  },
  "comprendre-chatgpt-amateur": {
    gradient: "from-blue-400 via-blue-600 to-violet-700",
    icon: "💬",
    pattern: "lines",
    accent: "#ffffff",
  },
  "agents-ia-confirme": {
    gradient: "from-indigo-500 via-blue-700 to-slate-900",
    icon: "🤖",
    pattern: "dots",
    accent: "#ffffff",
  },
};

const DEFAULT_CONFIG: ModuleConfig = {
  gradient: "from-blue-500 to-blue-800",
  icon: "🎓",
  pattern: "dots",
  accent: "#ffffff",
};

function PatternSVG({ pattern, color }: { pattern: ModuleConfig["pattern"]; color: string }) {
  const opacity = 0.08;
  switch (pattern) {
    case "dots":
      return (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`dots-${color}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill={color} fillOpacity={opacity} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#dots-${color})`} />
        </svg>
      );
    case "grid":
      return (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke={color} strokeWidth="0.5" strokeOpacity={opacity * 2} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      );
    case "lines":
      return (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lines" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <line x1="0" y1="16" x2="16" y2="0" stroke={color} strokeWidth="0.8" strokeOpacity={opacity * 1.5} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lines)" />
        </svg>
      );
    case "circles":
      return (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circles" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="8" fill="none" stroke={color} strokeWidth="0.8" strokeOpacity={opacity * 1.5} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circles)" />
        </svg>
      );
  }
}

interface ModuleIllustrationProps {
  slug: string;
  className?: string;
  iconSize?: "sm" | "md" | "lg";
}

export function ModuleIllustration({ slug, className = "", iconSize = "md" }: ModuleIllustrationProps) {
  const config = MODULE_CONFIGS[slug] ?? DEFAULT_CONFIG;

  const iconSizes = {
    sm: "text-4xl",
    md: "text-5xl",
    lg: "text-7xl",
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${config.gradient} ${className}`}>
      {/* Pattern de fond */}
      <PatternSVG pattern={config.pattern} color={config.accent} />

      {/* Icône centré */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`${iconSizes[iconSize]} select-none`}
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))" }}
          role="img"
          aria-hidden="true"
        >
          {config.icon}
        </span>
      </div>
    </div>
  );
}
