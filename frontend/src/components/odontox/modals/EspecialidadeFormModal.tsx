import { useState } from 'react';
import { useClinic } from '@/context/ClinicContext';
import { useModal } from '@/context/ModalContext';
import { useForm } from '@/hooks/useForm';
import { ApiError } from '@/lib/api';
import Modal from '@/components/odontox/Modal';
import ModalFooter from '@/components/odontox/ModalFooter';
import { TextInput } from '@/components/odontox/Field';
import type { Especialidade } from '@/lib/types';

export default function EspecialidadeFormModal({ entity }: { entity?: Especialidade }) {
  const { saveEspecialidade } = useClinic();
  const { close } = useModal();
  const [erro, setErro] = useState<string | null>(null);

  const { form, field } = useForm(
    entity
      ? { id: entity.id as number | undefined, nome: entity.nome }
      : { id: undefined as number | undefined, nome: '' }
  );

  const save = async () => {
    setErro(null);
    try {
      await saveEspecialidade(form);
      close();
    } catch (e) {
      // O backend valida o nome (mínimo 2 caracteres) e retorna 422 com a
      // mensagem no campo `errors.nome`. Mostramos inline em vez de fechar.
      if (e instanceof ApiError) {
        setErro(e.campo('nome') ?? e.message);
      } else {
        setErro('Não foi possível salvar a especialidade.');
      }
    }
  };

  return (
    <Modal onClose={close} maxWidth={460} title={entity ? 'Editar especialidade' : 'Nova especialidade'}>
      <div className="ox-scroll" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
        <TextInput
          label="Nome"
          placeholder="Ex.: Ortodontia"
          {...field('nome')}
          style={erro ? { border: '1px solid #BE123C' } : undefined}
        />
        {erro && (
          <p role="alert" style={{ margin: 0, color: '#BE123C', fontSize: 13, fontWeight: 600 }}>{erro}</p>
        )}
      </div>
      <ModalFooter onCancel={close} onSave={save} saveLabel="Salvar especialidade" />
    </Modal>
  );
}