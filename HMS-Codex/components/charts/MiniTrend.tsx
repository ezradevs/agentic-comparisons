'use client';

interface Props {
  data: number[];
  color?: string;
}

export function MiniTrend({ data, color = '#38bdf8' }: Props) {
  if (!data.length) {
    return null;
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = ((value - min) / (max - min || 1)) * 100;
      return `${x},${100 - y}`;
    })
    .join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '36px' }}>
      <polyline fill="none" stroke={color} strokeWidth={3} points={points} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
