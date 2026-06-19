import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

// Protege rotas: redireciona para /login se não autenticado.
export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
