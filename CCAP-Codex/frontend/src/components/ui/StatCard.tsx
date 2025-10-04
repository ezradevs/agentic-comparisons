import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: ReactNode;
  description?: string;
  icon?: ReactNode;
  accent?: 'blue' | 'green' | 'orange' | 'purple';
}

const accentMap: Record<NonNullable<StatCardProps['accent']>, string> = {
  blue: 'from-sky-500/10 via-sky-500/5 to-slate-900 border-sky-500/40',
  green: 'from-emerald-500/10 via-emerald-500/5 to-slate-900 border-emerald-500/40',
  orange: 'from-orange-500/10 via-orange-500/5 to-slate-900 border-orange-500/40',
  purple: 'from-violet-500/10 via-violet-500/5 to-slate-900 border-violet-500/40'
};

const StatCard = ({ title, value, description, icon, accent = 'blue' }: StatCardProps) => (
  <div
    className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${
      accentMap[accent]
    } p-5 transition hover:border-primary-500/60 hover:shadow-xl hover:shadow-primary-500/10`}
  >
    <div className="flex items-center justify-between">
      <div>
        <dt className="text-sm font-medium uppercase tracking-wide text-slate-400">{title}</dt>
        <dd className="mt-2 text-3xl font-semibold text-white">{value}</dd>
      </div>
      {icon && <div className="text-primary-200">{icon}</div>}
    </div>
    {description && <p className="mt-3 text-sm text-slate-400">{description}</p>}
  </div>
);

export default StatCard;
