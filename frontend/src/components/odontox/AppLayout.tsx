import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import ModalRoot from '@/components/odontox/modals/ModalRoot'
import { ClinicProvider } from '@/context/ClinicContext'
import { ModalProvider } from '@/context/ModalContext'

// Casca autenticada: sidebar fixa + área de conteúdo roteada + modais.
export default function AppLayout() {
  return (
    <ClinicProvider>
      <ModalProvider>
        <div style={{ height: '100vh', width: '100%', overflow: 'hidden', background: '#F4F7F8', display: 'flex' }}>
          <Sidebar />
          <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Outlet />
          </main>
          <ModalRoot />
        </div>
      </ModalProvider>
    </ClinicProvider>
  )
}
