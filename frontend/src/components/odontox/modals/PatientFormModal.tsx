import { useClinic } from '@/context/ClinicContext';
import { useModal } from '@/context/ModalContext';
import { useForm } from '@/hooks/useForm';
import Modal from '@/components/odontox/Modal';
import ModalFooter from '@/components/odontox/ModalFooter';
import { TextInput, TextArea } from '@/components/odontox/Field';
import type { Paciente } from '@/lib/types';

export default function PatientFormModal({ entity }: { entity?: Paciente }) {
  const { savePatient } = useClinic();
  const { close } = useModal();

  const { form, field } = useForm(
    entity
      ? { id: entity.id as number | undefined, nome: entity.nome, cpf: entity.cpf, nascimento: entity.nascimento, telefone: entity.telefone, email: entity.email, obs: entity.obs }
      : { id: undefined as number | undefined, nome: '', cpf: '', nascimento: '', telefone: '', email: '', obs: '' }
  );

  const save = () => { savePatient(form); close(); };

  return (
    <Modal onClose={close} maxWidth={520} title={entity ? 'Editar paciente' : 'Novo paciente'}>
      <div className="ox-scroll" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
        <TextInput label="Nome completo" placeholder="Nome do paciente" {...field('nome')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextInput label="CPF" placeholder="000.000.000-00" {...field('cpf')} />
          <TextInput label="Data de nascimento" type="date" {...field('nascimento')} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextInput label="Telefone" placeholder="(11) 90000-0000" {...field('telefone')} />
          <TextInput label="E-mail" placeholder="email@exemplo.com" {...field('email')} />
        </div>
        <TextArea label="Observações de saúde" rows={3} placeholder="Alergias, condições, medicações…" {...field('obs')} />
      </div>
      <ModalFooter onCancel={close} onSave={save} saveLabel="Salvar paciente" />
    </Modal>
  );
}
