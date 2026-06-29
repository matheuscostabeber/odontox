import { useModal } from '@/context/ModalContext';
import ConsultaDetailModal from './ConsultaDetailModal';
import ConsultaFormModal from './ConsultaFormModal';
import PatientFormModal from './PatientFormModal';
import DentistFormModal from './DentistFormModal';
import EspecialidadeFormModal from './EspecialidadeFormModal';
import AtendimentoFormModal from './AtendimentoFormModal';

// Renderiza o modal ativo conforme o tipo no ModalContext.
export default function ModalRoot() {
  const { modal } = useModal();
  if (!modal) return null;

  switch (modal.type) {
    case 'consultaDetail':
      return <ConsultaDetailModal id={modal.id as number} />;
    case 'consultaForm':
      return <ConsultaFormModal entity={modal.entity as never} prefill={modal.prefill as never} />;
    case 'patientForm':
      return <PatientFormModal entity={modal.entity as never} />;
    case 'dentistForm':
      return <DentistFormModal entity={modal.entity as never} />;
    case 'especialidadeForm':
      return <EspecialidadeFormModal entity={modal.entity as never} />;
    case 'atendimentoForm':
      return <AtendimentoFormModal consultaId={modal.consultaId as number} />;
    default:
      return null;
  }
}
