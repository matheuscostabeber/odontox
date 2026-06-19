import type { ReactNode } from 'react';
import Button from './Button';

type ModalFooterProps = {
  onCancel?: () => void;
  onSave?: () => void;
  saveLabel?: string;
  children?: ReactNode;
};

// Rodapé padrão dos modais de formulário: Cancelar + ação primária.
export default function ModalFooter({ onCancel, onSave, saveLabel = 'Salvar', children }: ModalFooterProps) {
  return (
    <div style={{ padding: '16px 24px', borderTop: '1px solid #EEF3F3', background: '#FAFBFB', display: 'flex', justifyContent: 'flex-end', gap: 10, flex: 'none', flexWrap: 'wrap' }}>
      {children}
      <Button variant="ghost" onClick={onCancel} hoverDim={false}>Cancelar</Button>
      <Button onClick={onSave}>{saveLabel}</Button>
    </div>
  );
}
