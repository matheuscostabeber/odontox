import { useClinic } from '@/context/ClinicContext';
import { useModal } from '@/context/ModalContext';
import { useNavigate } from 'react-router-dom';
import { fmtDate, endTime, statusMeta } from '@/lib/odontox/format';
import { Check, Pencil } from '@/components/odontox/icons';
import Modal from '@/components/odontox/Modal';
import Avatar from '@/components/odontox/Avatar';
import type { CSSProperties } from 'react';

const actBtn = (bg: string, color: string, border?: string): CSSProperties => ({ display: 'inline-flex', alignItems: 'center', gap: 7, background: bg, color, border: border || 'none', borderRadius: 9, padding: '10px 15px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' });

export default function ConsultaDetailModal({ id }: { id: number }) {
  const { consultas, dentist, patient, atendimentoFor, setConsultaStatus } = useClinic();
  const { open, close } = useModal();
  const navigate = useNavigate();

  const c = consultas.find((x) => x.id === id);
  if (!c) return null;
  const den = dentist(c.dentistaId);
  const pat = patient(c.pacienteId);
  const sm = statusMeta(c.status);
  const at = atendimentoFor(c.id);

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
      <Avatar nome={pat ? pat.nome : ''} id={c.pacienteId} size={44} fontSize={15} />
      <div>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#0F2225' }}>{pat ? pat.nome : '—'}</div>
        <div style={{ fontSize: 13, color: '#5B6B6E' }}>{c.procedimento}</div>
      </div>
    </div>
  );

  return (
    <Modal onClose={close} maxWidth={640} headerExtra={header}>
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 15 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13.5, color: '#94A3A5' }}>Status</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, padding: '5px 13px', borderRadius: 999, background: sm.bg, color: sm.text, border: '1px solid ' + sm.border }}>{sm.label}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Info label="Data" value={fmtDate(c.date, true)} />
          <Info label="Horário" value={c.hora + ' – ' + endTime(c.hora, c.duracao)} tabular />
          <div style={{ gridColumn: '1/3' }}><Info label="Profissional" value={(den ? den.nome : '—') + ' · ' + (den ? den.especialidade : '')} /></div>
        </div>
        {c.obs && c.obs.trim() && (
          <div style={{ background: '#F6FAFA', border: '1px solid #E6ECEC', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: '#94A3A5', marginBottom: 3 }}>Observações</div>
            <div style={{ fontSize: 13.5, color: '#33484B', lineHeight: 1.5 }}>{c.obs}</div>
          </div>
        )}
        {at && (
          <div style={{ background: '#E6F6EE', border: '1px solid #BCE8CF', borderRadius: 10, padding: '13px 15px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#047857', marginBottom: 4 }}>Atendimento registrado</div>
            <div style={{ fontSize: 13.5, color: '#1B2B2E', marginBottom: 7 }}>{at.procedimento_realizado}</div>
            <div style={{ fontSize: 13, color: '#33484B', lineHeight: 1.5 }}>{at.observacoes_clinicas}</div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 24px', borderTop: '1px solid #EEF3F3', background: '#FAFBFB', display: 'flex', flexWrap: 'wrap', gap: 9 }}>
        {c.status === 'agendada' && (
          <>
            <button onClick={() => setConsultaStatus(c.id, 'atendida')} style={actBtn('#059669', '#fff')}><Check size={15} /> Marcar atendida</button>
            <button onClick={() => setConsultaStatus(c.id, 'ausente')} style={actBtn('#fff', '#B45309', '1px solid #F6DCAE')}>Marcar ausência</button>
            <button onClick={() => open('consultaForm', { entity: c })} style={actBtn('#fff', '#33484B', '1px solid #DCE5E5')}>Editar</button>
            <button onClick={() => setConsultaStatus(c.id, 'cancelada')} style={{ ...actBtn('#fff', '#BE123C', '1px solid #F6C9D3'), marginLeft: 'auto' }}>Cancelar consulta</button>
          </>
        )}
        {c.status === 'atendida' && (
          <>
            <button onClick={() => open('atendimentoForm', { consultaId: c.id })} style={actBtn('#0E7A86', '#fff')}><Pencil size={15} color="#fff" /> {at ? 'Ver/editar atendimento' : 'Registrar atendimento'}</button>
            <button onClick={() => { close(); navigate('/paciente/' + c.pacienteId); }} style={actBtn('#fff', '#33484B', '1px solid #DCE5E5')}>Ver paciente</button>
          </>
        )}
      </div>
    </Modal>
  );
}

function Info({ label, value, tabular }: { label: string; value: string; tabular?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#94A3A5', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1B2B2E', fontVariantNumeric: tabular ? 'tabular-nums' : 'normal' }}>{value}</div>
    </div>
  );
}
