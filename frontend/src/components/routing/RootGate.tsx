import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

// Componente raiz: verifica a sessão (GET /api/me) uma vez no boot e
// segura a renderização até saber se há usuário logado.
export default function RootGate() {
  const carregando = useAuthStore((s) => s.carregando)
  const carregarSessao = useAuthStore((s) => s.carregarSessao)

  useEffect(() => {
    carregarSessao()
  }, [carregarSessao])

  if (carregando) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F4F7F8',
        }}
      >
        <div
          role="status"
          aria-label="Carregando"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '4px solid rgba(14,122,134,.18)',
            borderTopColor: '#0E7A86',
            animation: 'oxSpin .7s linear infinite',
          }}
        />
        <style>{`@keyframes oxSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return <Outlet />
}
