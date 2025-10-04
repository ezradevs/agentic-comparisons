interface StatusBadgeProps {
  label: string;
  tone?: 'green' | 'blue' | 'orange' | 'red' | 'slate' | 'purple';
}

const toneMap: Record<NonNullable<StatusBadgeProps['tone']>, string> = {
  green: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40',
  blue: 'bg-sky-500/10 text-sky-200 border border-sky-500/40',
  orange: 'bg-amber-500/10 text-amber-300 border border-amber-500/40',
  red: 'bg-rose-500/10 text-rose-200 border border-rose-500/40',
  slate: 'bg-slate-700/30 text-slate-200 border border-slate-600/40',
  purple: 'bg-violet-500/10 text-violet-200 border border-violet-500/40'
};

const StatusBadge = ({ label, tone = 'slate' }: StatusBadgeProps) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${toneMap[tone]}`}>
    {label}
  </span>
);

export default StatusBadge;
