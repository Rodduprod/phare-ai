'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  priority = false,
  fill = false 
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`bg-ink-50 border border-ink-100 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-ink-400 text-sm">Image indisponible</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        className={`transition-all duration-300 ${
          isLoading ? 'blur-sm' : 'blur-0'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        sizes={fill ? "100vw" : undefined}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-ink-50 animate-pulse" />
      )}
    </div>
  );
}