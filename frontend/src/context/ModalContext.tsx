// Controla qual modal está aberto e o formulário em edição.
// Um único "slot" de modal, como no design original.
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export interface ModalState {
  type: string
  [key: string]: unknown
}

interface ModalContextValue {
  modal: ModalState | null
  open: (type: string, payload?: Record<string, unknown>) => void
  close: () => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null) // { type, ...payload }
  const close = useCallback(() => setModal(null), [])
  const open = useCallback(
    (type: string, payload: Record<string, unknown> = {}) => setModal({ type, ...payload }),
    []
  )
  return <ModalContext.Provider value={{ modal, open, close }}>{children}</ModalContext.Provider>
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal precisa estar dentro de <ModalProvider>')
  return ctx
}
