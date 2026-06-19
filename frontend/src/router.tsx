import { createBrowserRouter, Navigate } from 'react-router-dom'

import RootGate from '@/components/routing/RootGate'
import RouteError from '@/components/routing/RouteError'
import OdontoxGuard from '@/components/routing/OdontoxGuard'
import AppLayout from '@/components/odontox/AppLayout'

import LoginPage from '@/pages/odontox/LoginPage'
import EsqueciSenhaPage from '@/pages/odontox/EsqueciSenhaPage'
import AgendaPage from '@/pages/odontox/AgendaPage'
import PacientesPage from '@/pages/odontox/PacientesPage'
import PacienteDetalhePage from '@/pages/odontox/PacienteDetalhePage'
import DentistasPage from '@/pages/odontox/DentistasPage'

export const router = createBrowserRouter([
  {
    element: <RootGate />,
    errorElement: <RouteError />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/esqueci-senha', element: <EsqueciSenhaPage /> },
      {
        element: <OdontoxGuard />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/agenda', element: <AgendaPage /> },
              { path: '/pacientes', element: <PacientesPage /> },
              { path: '/paciente/:id', element: <PacienteDetalhePage /> },
              { path: '/dentistas', element: <DentistasPage /> },
            ],
          },
        ],
      },
      { path: '/', element: <Navigate to="/agenda" replace /> },
      { path: '*', element: <Navigate to="/agenda" replace /> },
    ],
  },
])
