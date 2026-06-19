import type { CSSProperties, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { ChevronDown } from './icons';

const labelStyle: CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: '#33484B', marginBottom: 6 };
const inputStyle: CSSProperties = { width: '100%', padding: '11px 13px', border: '1px solid #DCE5E5', borderRadius: 10, fontSize: 14, background: '#fff', color: '#1B2B2E', fontFamily: 'inherit' };

export function Field({ label, children }: { label?: ReactNode; children?: ReactNode }) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      {children}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { label?: ReactNode };

export function TextInput({ label, ...rest }: TextInputProps) {
  return (
    <Field label={label}>
      <input {...rest} style={{ ...inputStyle, ...rest.style }} />
    </Field>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: ReactNode };

export function TextArea({ label, rows = 3, ...rest }: TextAreaProps) {
  return (
    <Field label={label}>
      <textarea {...rest} rows={rows} style={{ ...inputStyle, resize: 'vertical', ...rest.style }} />
    </Field>
  );
}

type Option = { value: string | number; label: ReactNode };
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: ReactNode; options: Option[] };

export function Select({ label, options, ...rest }: SelectProps) {
  return (
    <Field label={label}>
      <div style={{ position: 'relative' }}>
        <select {...rest} style={{ ...inputStyle, padding: '11px 36px 11px 13px', appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', ...rest.style }}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
          <ChevronDown color="#5B6B6E" />
        </span>
      </div>
    </Field>
  );
}
