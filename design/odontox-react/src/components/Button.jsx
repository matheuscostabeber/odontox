import { ACCENT } from '../utils/constants';

// Botão reutilizável. variant: 'primary' | 'ghost' | 'outline'
const VARIANTS = {
  primary: { background: ACCENT, color: '#fff', border: 'none' },
  ghost: { background: '#fff', color: '#33484B', border: '1px solid #DCE5E5' },
  outline: { background: '#fff', color: '#5B6B6E', border: '1px solid #DCE5E5' },
};

export default function Button({ variant = 'primary', children, style, hoverDim = true, ...rest }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  return (
    <button
      {...rest}
      onMouseEnter={hoverDim ? (e) => (e.currentTarget.style.filter = 'brightness(.94)') : undefined}
      onMouseLeave={hoverDim ? (e) => (e.currentTarget.style.filter = 'none') : undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        borderRadius: 10, padding: '11px 18px', fontSize: 14,
        fontWeight: v === VARIANTS.primary ? 700 : 600,
        cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '.2px',
        ...v, ...style,
      }}
    >
      {children}
    </button>
  );
}
