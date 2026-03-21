import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const LEVEL_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  débutant: { label: 'Débutant',  icon: '🌱', color: '#34c759' },
  amateur:  { label: 'Amateur',   icon: '🔧', color: '#99ccff' },
  confirmé: { label: 'Confirmé',  icon: '⚡', color: '#e53e3e' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title       = searchParams.get('title')       ?? 'Le Labo AI';
  const description = searchParams.get('description') ?? "L'IA décryptée en français.";
  const level       = searchParams.get('level')       ?? 'amateur';
  const tags        = (searchParams.get('tags') ?? '').split(',').filter(Boolean).slice(0, 4);

  const lv = LEVEL_CONFIG[level] ?? LEVEL_CONFIG['amateur'];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0d0d0d',
          padding: '64px',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Gradient accent top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${lv.color}, transparent)`,
          }}
        />

        {/* Logo / Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            🧪 Le Labo AI
          </div>
        </div>

        {/* Level badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              border: `1px solid ${lv.color}`,
              color: lv.color,
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            <span>{lv.icon}</span>
            <span>{lv.label}</span>
          </div>

          {/* Tags */}
          {tags.map((tag) => (
            <div
              key={tag}
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                border: '1px solid #333',
                color: '#888',
                fontSize: '13px',
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 60 ? '36px' : '44px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            flex: 1,
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* Description */}
        {description && (
          <div
            style={{
              fontSize: '18px',
              color: '#888888',
              lineHeight: 1.5,
              maxWidth: '800px',
              marginTop: '20px',
              marginBottom: '40px',
              overflow: 'hidden',
              display: '-webkit-box',
            }}
          >
            {description.slice(0, 120)}{description.length > 120 ? '…' : ''}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: '15px', color: '#555' }}>
            lelabo.ai
          </div>
          <div
            style={{
              fontSize: '13px',
              color: '#444',
              padding: '6px 14px',
              border: '1px solid #222',
              borderRadius: '6px',
            }}
          >
            L'IA décryptée en français
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
