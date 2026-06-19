import { addDays, parseDate, pad } from '../../utils/format';
import { ACCENT, TODAY } from '../../utils/constants';

const WD_SHORT = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

// Faixa de dias da semana (segunda a sábado) da semana de viewDate.
export default function WeekStrip({ viewDate, onSelect }) {
  const dt = parseDate(viewDate);
  const dow = (dt.getDay() + 6) % 7; // segunda = 0
  const monday = addDays(viewDate, -dow);

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {WD_SHORT.map((w, i) => {
        const dd = addDays(monday, i);
        const sel = dd === viewDate;
        const isToday = dd === TODAY;
        return (
          <div
            key={dd}
            onClick={() => onSelect(dd)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 0 9px', borderRadius: 12, cursor: 'pointer', border: '1px solid ' + (sel ? ACCENT : 'transparent'), background: sel ? '#EAF4F4' : 'transparent', minWidth: 52 }}
          >
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.6px', color: sel ? ACCENT : '#859799' }}>{w}</span>
            <span style={{ fontSize: 17, fontWeight: 700, color: sel ? ACCENT : '#2A3D40', fontVariantNumeric: 'tabular-nums' }}>{parseDate(dd).getDate()}</span>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: isToday ? ACCENT : 'transparent' }} />
          </div>
        );
      })}
    </div>
  );
}
