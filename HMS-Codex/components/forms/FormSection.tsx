'use client';

interface Props {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function FormSection({ title, description, children }: Props) {
  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      {(title || description) && (
        <header style={{ display: 'grid', gap: '0.35rem' }}>
          {title ? <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3> : null}
          {description ? <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{description}</p> : null}
        </header>
      )}
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>{children}</div>
    </section>
  );
}
