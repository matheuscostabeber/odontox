import { statusMeta } from '@/lib/odontox/format';
import type { StatusConsulta } from '@/lib/types';

type StatusBadgeProps = {
  status: StatusConsulta;
  size?: 'sm' | 'md';
};

// Etiqueta de status de consulta (Agendada / Atendida / Cancelada / Ausente)
export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const m = statusMeta(status);
  const pad = size === 'md' ? '5px 13px' : '3px 10px';
  const fs = size === 'md' ? 12.5 : 11.5;
  return (
    <span style={{ fontSize: fs, fontWeight: 700, padding: pad, borderRadius: 999, background: m.bg, color: m.text, border: '1px solid ' + m.border, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
}
