import { useMemo } from 'react';
import { useClinic } from '@/context/ClinicContext';
import { useModal } from '@/context/ModalContext';
import { useForm } from '@/hooks/useForm';
import { DURACAO_OPTIONS, STATUS_OPTIONS, TODAY } from '@/lib/odontox/constants';
import Modal from '@/components/odontox/Modal';
import ModalFooter from '@/components/odontox/ModalFooter';
import { Select, TextInput, TextArea } from '@/components/odontox/Field';
import type { Consulta, StatusConsulta } from '@/lib/types';

interface ConsultaPrefill {
  pacienteId?: number;
  dentistaId?: number;
  data?: string;
}

export default function ConsultaFormModal({ entity, prefill }: { entity?: Consulta; prefill?: ConsultaPrefill }) {
  const { patients, dentists, saveConsulta } = useClinic();
  const { close } = useModal();

  const initial = entity
    ? { id: entity.id as number | undefined, pacienteId: entity.pacienteId, dentistaId: entity.dentistaId, data: entity.date, hora: entity.hora, duracao: entity.duracao, procedimento: entity.procedimento, status: entity.status as StatusConsulta, observacoes: entity.obs }
    : {
        id: undefined as number | undefined,
        pacienteId: (prefill && prefill.pacienteId) || patients[0]?.id,
        dentistaId: (prefill && prefill.dentistaId) || dentists.find((d) => d.ativo)?.id,
        data: (prefill && prefill.data) || TODAY,
        hora: '09:00', duracao: 60, procedimento: '', status: 'agendada' as StatusConsulta, observacoes: '',
      };

  const { form, field } = useForm(initial);

  const pacienteOptions = useMemo(
    () => patients.slice().sort((a, b) => a.nome.localeCompare(b.nome)).map((p) => ({ value: p.id, label: p.nome })),
    [patients]
  );
  const dentistaOptions = useMemo(
    () => dentists.filter((d) => d.ativo).map((d) => ({ value: d.id, label: d.nome + ' · ' + d.especialidade })),
    [dentists]
  );

  const save = () => { saveConsulta(form); close(); };

  return (
    <Modal onClose={close} maxWidth={520} title={entity ? 'Editar consulta' : 'Nova consulta'}>
      <div className="ox-scroll" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
        <Select label="Paciente" options={pacienteOptions} {...field('pacienteId')} />
        <Select label="Dentista" options={dentistaOptions} {...field('dentistaId')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <TextInput label="Data" type="date" {...field('data')} />
          <TextInput label="Hora" type="time" {...field('hora')} />
          <Select label="Duração" options={DURACAO_OPTIONS} {...field('duracao')} />
        </div>
        <TextInput label="Procedimento previsto" placeholder="Ex.: Profilaxia, Restauração, Avaliação…" {...field('procedimento')} />
        <Select label="Status" options={STATUS_OPTIONS} {...field('status')} />
        <TextArea label="Observações" rows={3} placeholder="Anotações da consulta…" {...field('observacoes')} />
      </div>
      <ModalFooter onCancel={close} onSave={save} saveLabel="Salvar consulta" />
    </Modal>
  );
}
