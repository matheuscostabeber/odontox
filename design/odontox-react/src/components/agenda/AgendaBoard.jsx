import { minutes } from '../../utils/format';
import { START_H, END_H, HOUR_H } from '../../utils/constants';
import Avatar from '../Avatar';
import ConsultaBlock from './ConsultaBlock';

const hourMarks = [];
for (let h = START_H; h <= END_H; h++) hourMarks.push({ h, label: String(h).padStart(2, '0') + ':00', top: (h - START_H) * HOUR_H });
const BOARD_H = (END_H - START_H) * HOUR_H;

// Quadro da agenda: régua de horas + uma coluna por dentista.
export default function AgendaBoard({ dentists, consultas, patientById, onConsultaClick }) {
  return (
    <div className="ox-scroll" style={{ flex: 1, overflow: 'auto', background: '#F4F7F8' }}>
      <div style={{ display: 'flex', minWidth: 'max-content', minHeight: '100%' }}>
        {/* régua de horas */}
        <div style={{ flex: 'none', width: 64, borderRight: '1px solid #E6ECEC', background: '#fff', position: 'relative', paddingTop: 46 }}>
          <div style={{ position: 'relative', height: BOARD_H }}>
            {hourMarks.map((m) => (
              <div key={m.h} style={{ position: 'absolute', top: m.top, left: 0, right: 0, transform: 'translateY(-50%)', textAlign: 'right', paddingRight: 10, fontSize: 11.5, fontWeight: 600, color: '#94A3A5', fontVariantNumeric: 'tabular-nums' }}>{m.label}</div>
            ))}
          </div>
        </div>

        {/* colunas por dentista */}
        {dentists.map((d) => {
          const blocks = consultas
            .filter((c) => c.dentistaId === d.id)
            .sort((a, b) => minutes(a.hora) - minutes(b.hora));
          return (
            <div key={d.id} style={{ flex: 1, minWidth: 240, borderRight: '1px solid #E6ECEC', background: '#fff' }}>
              <div style={{ position: 'sticky', top: 0, zIndex: 2, background: '#fff', borderBottom: '1px solid #E6ECEC', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 9, height: 46 }}>
                <Avatar nome={d.nome} color={d.cor} size={30} shape="rounded" fontSize={12} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1B2B2E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.nome}</div>
                  <div style={{ fontSize: 11.5, color: '#94A3A5', whiteSpace: 'nowrap' }}>{d.especialidade}</div>
                </div>
              </div>
              <div style={{ position: 'relative', height: BOARD_H }}>
                {hourMarks.map((m) => (
                  <div key={m.h} style={{ position: 'absolute', top: m.top, left: 0, right: 0, borderTop: '1px solid #EEF3F3' }} />
                ))}
                {blocks.map((c) => {
                  const pat = patientById(c.pacienteId);
                  return (
                    <ConsultaBlock key={c.id} consulta={c} patientName={pat ? pat.nome : '—'} dentistColor={d.cor} onClick={() => onConsultaClick(c.id)} />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
