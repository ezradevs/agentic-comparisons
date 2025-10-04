import { ReactNode } from 'react';

interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

const SectionHeading = ({ title, description, action }: SectionHeadingProps) => (
  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {description && <p className="text-sm text-slate-400">{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default SectionHeading;
