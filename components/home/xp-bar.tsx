'use client';

import { useEffect, useState } from 'react';

export default function XpBar({ progress }: { progress: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(progress), 150);
    return () => clearTimeout(t);
  }, [progress]);

  return (
    <div className="h-2 bg-border rounded-full overflow-hidden">
      <div
        className="h-full bg-gold rounded-full"
        style={{
          width: `${width}%`,
          transition: 'width 1.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
}
