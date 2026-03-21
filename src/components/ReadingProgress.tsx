'use client';

import { useEffect, useState } from 'react';

interface ReadingProgressProps {
  color?: string;
}

export function ReadingProgress({ color = '#99ccff' }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[3px] origin-left transition-transform duration-100 ease-out"
      style={{
        background: color,
        transform: `scaleX(${progress / 100})`,
        boxShadow: `0 0 8px ${color}80`,
      }}
      aria-hidden="true"
    />
  );
}
