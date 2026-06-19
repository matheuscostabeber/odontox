import { ChevronDown } from './icons';

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 700, color: '#33484B', marginBottom: 6 };
const inputStyle = { width: '100%', padding: '11px 13px', border: '1px solid #DCE5E5', borderRadius: 10, fontSize: 14, background: '#fff', color: '#1B2B2E', fontFamily: 'inherit' };

export function Field({ label, children }) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      {children}
    </div>
  );
}

export function TextInput({ label, ...rest }) {
  return (
    <Field label={label}>
      <input {...rest} style={{ ...inputStyle, ...rest.style }} />
    </Field>
  );
}

export function TextArea({ label, rows = 3, ...rest }) {
  return (
    <Field label={label}>
      <textarea {...rest} rows={rows} style={{ ...inputStyle, resize: 'vertical', ...rest.style }} />
    </Field>
  );
}

export function Select({ label, options, ...rest }) {
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
