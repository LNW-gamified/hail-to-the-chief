'use client';

import { useEffect, useState } from 'react';

type Props = {
  visited: number;
  total: number;
  size?: number;
  strokeWidth?: number;
};

export default function ProgressRing({ visited, total, size = 200, strokeWidth = 12 }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setProgress(total > 0 ? Math.min(visited / total, 1) : 0), 150);
    return () => clearTimeout(t);
  }, [visited, total]);

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const center = size / 2;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke="#1E3A5F" strokeWidth={strokeWidth}
      />
      <circle
        cx={center} cy={center} r={radius}
        fill="none" stroke="#C9A84C" strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </svg>
  );
}
