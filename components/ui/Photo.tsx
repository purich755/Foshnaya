import type { CSSProperties } from 'react';
import { photo, type PhotoId } from '@/data/photos';

type Props = {
  id: PhotoId;
  sizes: string;
  className?: string;
  priority?: boolean;
  alt?: string;
  /** object-position кадра */
  pos?: string;
  style?: CSSProperties;
  /** кружок курсора «СМОТРЕТЬ» */
  view?: boolean;
};

/** Локальное фото в нескольких ширинах WebP (готовит scripts/fetch-photos.mjs). */
export default function Photo({ id, sizes, className, priority, alt, pos, style, view }: Props) {
  const p = photo(id);
  const srcSet = p.widths.map((w) => `${p.src}-${w}.webp ${w}w`).join(', ');
  const mid = p.widths.find((w) => w >= 1280) ?? p.widths[p.widths.length - 1];
  return (
    <img
      src={`${p.src}-${mid}.webp`}
      srcSet={srcSet}
      sizes={sizes}
      width={p.width}
      height={p.height}
      alt={alt ?? p.alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : undefined}
      draggable={false}
      data-cursor={view ? 'view' : undefined}
      style={{ backgroundColor: p.color, objectPosition: pos, ...style }}
    />
  );
}
