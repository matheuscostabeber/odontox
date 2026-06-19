import { useClinic } from '../../context/ClinicContext';
import { useModal } from '../../context/ModalContext';
import { useForm } from '../../hooks/useForm';
import { ACCENT } from '../../utils/constants';
import Modal from '../Modal';
import ModalFooter from '../ModalFooter';
import { Field, TextInput } from '../Field';

export default function DentistFormModal({ entity }) {
  const { saveDentist } = useClinic();
  const { close } = useModal();

  const { form, field, set } = useForm(
    entity
      ? { id: entity.id, nome: entity.nome, cro: entity.cro, especialidade: entity.especialidade, telefone: entity.telefone, email: entity.email, ativo: entity.ativo }
      : { id: null, nome: '', cro: '', especialidade: '', telefone: '', email: '', ativo: true }
  );

  const save = () => { saveDentist(form); close(); };

  const toggle = (val, on, onColor, onBg) => ({
    flex: 1, padding: 11, borderRadius: 10, border: '1px solid ' + (val === on ? onColor : '#DCE5E5'),
    background: val === on ? onBg : '#fff', color: val === on ? onColor : '#5B6B6E',
    fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
  });

  return (
    <Modal onClose={close} maxWidth={520} title={entity ? 'Editar dentista' : 'Novo dentista'}>
      <div className="ox-scroll" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'auto' }}>
        <TextInput label="Nome" placeholder="Dr(a). Nome Sobrenome" {...field('nome')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextInput label="CRO" placeholder="CRO-SP 00000" {...field('cro')} />
          <TextInput label="Especialidade" placeholder="Ex.: Ortodontia" {...field('especialidade')} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TextInput label="Telefone" placeholder="(11) 90000-0000" {...field('telefone')} />
          <TextInput label="E-mail" placeholder="email@odontox.com" {...field('email')} />
        </div>
        <Field label="Situação na agenda">
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => set('ativo', true)} style={toggle(form.ativo, true, ACCENT, '#EAF4F4')}>Ativo</button>
            <button onClick={() => set('ativo', false)} style={toggle(form.ativo, false, '#BE123C', '#FDEAEE')}>Inativo</button>
          </div>
        </Field>
      </div>
      <ModalFooter onCancel={close} onSave={save} saveLabel="Salvar dentista" />
    </Modal>
  );
}
