'use client';
import styles from './GlassPanel.module.css';

interface Props {
  title?: string;
  caption?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function GlassPanel({ title, caption, actions, children }: Props) {
  return (
    <article className={styles.panel}>
      {(title || caption || actions) && (
        <header className={styles.header}>
          <div>
            {title ? <div className={styles.title}>{title}</div> : null}
            {caption ? <div className={styles.caption}>{caption}</div> : null}
          </div>
          <div className={styles.actions}>{actions}</div>
        </header>
      )}
      <div>{children}</div>
    </article>
  );
}
