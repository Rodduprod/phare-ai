'use client';

import { ArticleLevel, levelConfig } from "@/lib/articles";
import { useState } from "react";

interface LevelFilterProps {
  selectedLevel: ArticleLevel | 'all';
  onLevelChange: (level: ArticleLevel | 'all') => void;
  articleCounts: Record<ArticleLevel, number>;
}

export function LevelFilter({ selectedLevel, onLevelChange, articleCounts }: LevelFilterProps) {
  const [hoveredLevel, setHoveredLevel] = useState<ArticleLevel | 'all' | null>(null);

  const levels: (ArticleLevel | 'all')[] = ['all', 'débutant', 'amateur', 'confirmé'];

  const getLevelInfo = (level: ArticleLevel | 'all') => {
    if (level === 'all') {
      return {
        label: 'Tous',
        icon: '🔍',
        color: '#8a8a8a',
        count: Object.values(articleCounts).reduce((sum, count) => sum + count, 0)
      };
    }
    return {
      ...levelConfig[level],
      count: articleCounts[level]
    };
  };

  return (
    <div className="mb-8">
      <h3 className="text-display-md text-text mb-4">Filtrer par niveau</h3>
      <div className="flex flex-wrap gap-3">
        {levels.map((level) => {
          const info = getLevelInfo(level);
          const isSelected = selectedLevel === level;
          const isHovered = hoveredLevel === level;
          
          return (
            <button
              key={level}
              onClick={() => onLevelChange(level)}
              onMouseEnter={() => setHoveredLevel(level)}
              onMouseLeave={() => setHoveredLevel(null)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200
                ${isSelected 
                  ? 'border-current shadow-sm' 
                  : 'border-border hover:border-current hover:shadow-sm'
                }
              `}
              style={{
                color: isSelected || isHovered ? info.color : 'var(--color-text-muted)',
                backgroundColor: isSelected ? `${info.color}10` : 'transparent'
              }}
            >
              <span className="text-lg">{info.icon}</span>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium">{info.label}</span>
                <span className="text-xs opacity-75">{info.count} article{info.count > 1 ? 's' : ''}</span>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Description du niveau sélectionné */}
      {selectedLevel !== 'all' && (
        <div className="mt-4 p-4 rounded-lg border border-border bg-bg-alt">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{levelConfig[selectedLevel].icon}</span>
            <div>
              <h4 className="font-medium text-text mb-1">{levelConfig[selectedLevel].label}</h4>
              <p className="text-sm text-text-body mb-2">{levelConfig[selectedLevel].description}</p>
              <p className="text-xs text-text-muted">
                👥 {levelConfig[selectedLevel].audience}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}