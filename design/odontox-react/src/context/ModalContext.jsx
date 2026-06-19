// Controla qual modal está aberto e o formulário em edição.
// Um único "slot" de modal, como no design original.
import { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null); // { type, ...payload }
  const close = useCallback(() => setModal(null), []);
  const open = useCallback((type, payload = {}) => setModal({ type, ...payload }), []);
  return (
    <ModalContext.Provider value={{ modal, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal precisa estar dentro de <ModalProvider>');
  return ctx;
}
