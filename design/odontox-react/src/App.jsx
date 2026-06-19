import { Routes, Route, Navigate } from 'react-router';
import { useAuth } from './context/AuthContext';
import RequireAuth from './components/RequireAuth';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import EsqueciSenhaPage from './pages/EsqueciSenhaPage';
import AgendaPage from './pages/AgendaPage';
import PacientesPage from './pages/PacientesPage';
import PacienteDetalhePage from './pages/PacienteDetalhePage';
import DentistasPage from './pages/DentistasPage';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/agenda" replace /> : <LoginPage />} />
      <Route path="/esqueci-senha" element={isAuthenticated ? <Navigate to="/agenda" replace /> : <EsqueciSenhaPage />} />

      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/pacientes" element={<PacientesPage />} />
        <Route path="/paciente/:id" element={<PacienteDetalhePage />} />
        <Route path="/dentistas" element={<DentistasPage />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? '/agenda' : '/login'} replace />} />
    </Routes>
  );
}
