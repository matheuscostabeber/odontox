import { initials as toInitials, avatarColor } from '@/lib/odontox/format';

type AvatarProps = {
  nome: string;
  id?: number;
  color?: string;
  size?: number;
  radius?: number | string;
  fontSize?: number;
  shape?: 'circle' | 'rounded';
  foto?: string | null;
};

// Avatar com iniciais (ou foto, se informada). shape: 'circle' | 'rounded'
export default function Avatar({ nome, id, color, size = 36, radius, fontSize, shape = 'circle', foto }: AvatarProps) {
  const bg = color || avatarColor(id || 0);
  const br = radius != null ? radius : shape === 'rounded' ? Math.round(size * 0.26) : '50%';
  return (
    <div
      style={{
        width: size, height: size, borderRadius: br, background: bg, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: fontSize || Math.round(size * 0.38), fontWeight: 700, flex: 'none',
        overflow: 'hidden',
      }}
    >
      {foto ? (
        <img src={foto} alt={nome} style={{ width: size, height: size, objectFit: 'cover', borderRadius: br, display: 'block' }} />
      ) : (
        toInitials(nome)
      )}
    </div>
  );
}
