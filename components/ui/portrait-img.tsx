'use client';

import { useState } from 'react';

export function PortraitImg({
  src,
  alt,
  className,
  style,
  fallback,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return fallback ? <>{fallback}</> : null;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}
