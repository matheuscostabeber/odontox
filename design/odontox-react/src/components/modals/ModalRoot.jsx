import { useModal } from '../../context/ModalContext';
import ConsultaDetailModal from './ConsultaDetailModal';
import ConsultaFormModal from './ConsultaFormModal';
import PatientFormModal from './PatientFormModal';
import DentistFormModal from './DentistFormModal';
import AtendimentoFormModal from './AtendimentoFormModal';

// Renderiza o modal ativo conforme o tipo no ModalContext.
export default function ModalRoot() {
  const { modal } = useModal();
  if (!modal) return null;

  switch (modal.type) {
    case 'consultaDetail':
      return <ConsultaDetailModal id={modal.id} />;
    case 'consultaForm':
      return <ConsultaFormModal entity={modal.entity} prefill={modal.prefill} />;
    case 'patientForm':
      return <PatientFormModal entity={modal.entity} />;
    case 'dentistForm':
      return <DentistFormModal entity={modal.entity} />;
    case 'atendimentoForm':
      return <AtendimentoFormModal consultaId={modal.consultaId} />;
    default:
      return null;
  }
}
