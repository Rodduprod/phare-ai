'use client';

import Link from 'next/link';
import { ArticleLevel, ArticleVersion, levelConfig } from '@/lib/articles-types';

interface LevelSwitcherProps {
  currentLevel: ArticleLevel;
  versions: ArticleVersion[];  // toutes les versions existantes (siblings + current)
}

const ALL_LEVELS: ArticleLevel[] = ['débutant', 'amateur', 'confirmé'];

export function LevelSwitcher({ currentLevel, versions }: LevelSwitcherProps) {
  if (versions.length <= 1) return null;

  return (
    <div className="flex flex-col gap-2 my-6 p-4 rounded-xl border border-border bg-bg-alt">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
        Adapter le niveau de lecture
      </p>
      <div className="flex flex-wrap gap-2">
        {ALL_LEVELS.map((level) => {
          const version = versions.find((v) => v.level === level);
          const config = levelConfig[level];
          const isCurrent = level === currentLevel;

          if (!version) {
            // Version inexistante — affichée en grisé
            return (
              <span
                key={level}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border text-sm text-text-muted opacity-40 cursor-not-allowed select-none"
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
                <span className="text-xs opacity-60">à venir</span>
              </span>
            );
          }

          if (isCurrent) {
            return (
              <span
                key={level}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold cursor-default"
                style={{
                  borderColor: config.color,
                  color: config.color,
                  backgroundColor: `${config.color}15`,
                }}
              >
                <span>{config.icon}</span>
                <span>{config.label}</span>
                <span className="text-xs opacity-70">(actuel)</span>
              </span>
            );
          }

          return (
            <Link
              key={level}
              href={`/articles/${version.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-text-body hover:border-current transition-all duration-150"
              style={{ ['--hover-color' as string]: config.color }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = config.color;
                el.style.borderColor = config.color;
                el.style.backgroundColor = `${config.color}10`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.color = '';
                el.style.borderColor = '';
                el.style.backgroundColor = '';
              }}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
              <span className="text-xs text-text-muted">{version.readingTime}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
