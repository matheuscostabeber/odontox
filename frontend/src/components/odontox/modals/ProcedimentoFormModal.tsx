import { useClinic } from '@/context/ClinicContext';
import { useModal } from '@/context/ModalContext';
import { useForm } from '@/hooks/useForm';
import Modal from '@/components/odontox/Modal';
import ModalFooter from '@/components/odontox/ModalFooter';
import { TextInput } from '@/components/odontox/Field';
import type { Procedimento } from '@/lib/types';

export default function ProcedimentoFormModal({ entity }: { entity?: Procedimento }) {
  const { saveProcedimento } = useClinic();
  const { close } = useModal();

  const { form, field } = useForm(
    entity
      ? { id: entity.id as number | undefined, nome: entity.nome, duracaoMinutos: entity.duracaoMinutos, valorReferencia: entity.valorReferencia }
      : { id: undefined as number | undefined, nome: '', duracaoMinutos: 30, valorReferencia: 0 }
  );

  const save = () => { saveProcedimento(form); close(); };

  return (
    <Modal onClose={close} maxWidth={520} title={entity ? 'Editar procedimento' : 'Novo procedimento'}>
      <div className="ox-scroll" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
        <TextInput label="Nome" placeholder="Ex.: Profilaxia, Restauração, Canal…" {...field('nome')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextInput label="Duração (minutos)" type="number" {...field('duracaoMinutos')} />
          <TextInput label="Valor de referência (R$)" type="number" {...field('valorReferencia')} />
        </div>
      </div>
      <ModalFooter onCancel={close} onSave={save} saveLabel="Salvar procedimento" />
    </Modal>
  );
}