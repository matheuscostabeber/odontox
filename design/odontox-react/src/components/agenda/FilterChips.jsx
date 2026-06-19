import { ACCENT } from '../../utils/constants';

// Chips para filtrar a agenda por profissional ('all' = todos).
export default function FilterChips({ dentists, filter, onChange }) {
  const chips = [{ id: 'all', label: 'Todos os profissionais', cor: null }].concat(
    dentists.map((d) => ({ id: d.id, label: d.nome.replace(/^Dra?\.\s/, ''), cor: d.cor }))
  );

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      {chips.map((c) => {
        const on = filter === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 999, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap', border: '1px solid ' + (on ? ACCENT : '#DCE5E5'), background: on ? '#EAF4F4' : '#fff', color: on ? ACCENT : '#5B6B6E' }}
          >
            {c.cor && <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.cor }} />}
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
