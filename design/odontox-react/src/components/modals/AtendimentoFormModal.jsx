import { useClinic } from '../../context/ClinicContext';
import { useModal } from '../../context/ModalContext';
import { useForm } from '../../hooks/useForm';
import { shortDate } from '../../utils/format';
import Modal from '../Modal';
import ModalFooter from '../ModalFooter';
import { TextInput, TextArea } from '../Field';

export default function AtendimentoFormModal({ consultaId }) {
  const { consultas, dentist, patient, atendimentoFor, saveAtendimento } = useClinic();
  const { close } = useModal();

  const c = consultas.find((x) => x.id === consultaId);
  const existing = atendimentoFor(consultaId);

  const { form, field } = useForm(
    existing
      ? { procedimento_realizado: existing.procedimento_realizado, observacoes_clinicas: existing.observacoes_clinicas }
      : { procedimento_realizado: '', observacoes_clinicas: '' }
  );

  if (!c) return null;
  const pat = patient(c.pacienteId);
  const den = dentist(c.dentistaId);

  const save = () => { saveAtendimento(consultaId, form, existing ? existing.id : null); close(); };

  return (
    <Modal onClose={close} maxWidth={520} title={existing ? 'Editar atendimento' : 'Registrar atendimento'} subtitle={(pat ? pat.nome : '—') + ' · ' + shortDate(c.date)}>
      <div className="ox-scroll" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: '#F6FAFA', border: '1px solid #E6ECEC', borderRadius: 10, padding: 14 }}>
          <Ctx label="Paciente" value={pat ? pat.nome : '—'} />
          <Ctx label="Profissional" value={den ? den.nome : '—'} />
          <Ctx label="Data" value={shortDate(c.date)} />
          <Ctx label="Procedimento previsto" value={c.procedimento} />
        </div>
        <TextInput label="Procedimento realizado" placeholder="O que foi feito na consulta" {...field('procedimento_realizado')} />
        <TextArea label="Observações clínicas" rows={4} placeholder="Anotações clínicas, prescrições, orientações…" {...field('observacoes_clinicas')} />
      </div>
      <ModalFooter onCancel={close} onSave={save} saveLabel="Salvar atendimento" />
    </Modal>
  );
}

function Ctx({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#94A3A5', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1B2B2E' }}>{value}</div>
    </div>
  );
}
