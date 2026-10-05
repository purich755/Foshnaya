import type { CSSProperties } from 'react';

type Props = {
  size?: number;
  color?: string;
  opacity?: number;
  className?: string;
  style?: CSSProperties;
};

/** Сетка плитки: квадраты со швами 1px. Отсылка к облицовке стойки. */
export default function TileGrid({ size = 56, color = 'var(--ochre-d)', opacity = 0.35, className, style }: Props) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
        backgroundImage: `linear-gradient(to right, ${color} 1px, transparent 1px), linear-gradient(to bottom, ${color} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: 'center top',
        ...style,
      }}
    />
  );
}
