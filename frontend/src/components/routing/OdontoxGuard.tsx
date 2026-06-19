import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

// Portão de acesso autenticado: enquanto a sessão carrega, não renderiza nada
// (o RootGate já cuida do spinner global). Sem usuário → redireciona ao login.
export default function OdontoxGuard() {
  const carregando = useAuthStore((s) => s.carregando)
  const usuario = useAuthStore((s) => s.usuario)

  if (carregando) return null
  if (!usuario) return <Navigate to="/login" replace />

  return <Outlet />
}
