import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from './icons';

type ModalProps = {
  children?: ReactNode;
  onClose: () => void;
  maxWidth?: number;
  title?: ReactNode;
  subtitle?: ReactNode;
  headerExtra?: ReactNode;
};

// Shell de modal: backdrop com blur + card animado. Fecha no clique fora e no Esc.
export default function Modal({ children, onClose, maxWidth = 480, title, subtitle, headerExtra }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="ox-modal-back"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(12,28,30,.45)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 24 }}
    >
      <div
        className="ox-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth, boxShadow: '0 24px 70px rgba(8,30,33,.28)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
      >
        {(title || headerExtra) && (
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #EEF3F3', display: 'flex', alignItems: title && subtitle ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 12, flex: 'none' }}>
            {headerExtra || (
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0F2225' }}>{title}</h3>
                {subtitle && <div style={{ fontSize: 13, color: '#5B6B6E', marginTop: 2 }}>{subtitle}</div>}
              </div>
            )}
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3A5', padding: 4, display: 'flex' }}>
              <X />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
