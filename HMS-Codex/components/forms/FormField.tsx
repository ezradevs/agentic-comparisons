'use client';
import styles from './FormField.module.css';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  as?: 'input' | 'textarea' | 'select';
  options?: Array<{ label: string; value: string }>;
}

export function FormField({ label, helperText, as = 'input', options = [], ...props }: Props) {
  const fieldId = props.id ?? `field-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
      </label>
      {as === 'select' ? (
        <select id={fieldId} className={styles.select} {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}>
          {options.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : as === 'textarea' ? (
        <textarea id={fieldId} className={styles.textarea} {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input id={fieldId} className={styles.input} {...props} />
      )}
      {helperText ? <div className={styles.helper}>{helperText}</div> : null}
    </div>
  );
}
