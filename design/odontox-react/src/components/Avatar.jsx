import { initials as toInitials, avatarColor } from '../utils/format';

// Avatar com iniciais. shape: 'circle' | 'rounded'
export default function Avatar({ nome, id, color, size = 36, radius, fontSize, shape = 'circle' }) {
  const bg = color || avatarColor(id || 0);
  const br = radius != null ? radius : shape === 'rounded' ? Math.round(size * 0.26) : '50%';
  return (
    <div
      style={{
        width: size, height: size, borderRadius: br, background: bg, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: fontSize || Math.round(size * 0.38), fontWeight: 700, flex: 'none',
      }}
    >
      {toInitials(nome)}
    </div>
  );
}
