import Button from './Button';

// Rodapé padrão dos modais de formulário: Cancelar + ação primária.
export default function ModalFooter({ onCancel, onSave, saveLabel = 'Salvar', children }) {
  return (
    <div style={{ padding: '16px 24px', borderTop: '1px solid #EEF3F3', background: '#FAFBFB', display: 'flex', justifyContent: 'flex-end', gap: 10, flex: 'none', flexWrap: 'wrap' }}>
      {children}
      <Button variant="ghost" onClick={onCancel} hoverDim={false}>Cancelar</Button>
      <Button onClick={onSave}>{saveLabel}</Button>
    </div>
  );
}
