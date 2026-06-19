import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom'

// errorElement da rota raiz: isola crashes de render para que um erro em uma
// página não derrube o app inteiro (white screen).
export default function RouteError() {
  const error = useRouteError()

  let titulo = 'Algo deu errado'
  let detalhe = 'Ocorreu um erro inesperado ao carregar esta página.'

  if (isRouteErrorResponse(error)) {
    titulo = `${error.status} ${error.statusText}`
    detalhe = typeof error.data === 'string' ? error.data : detalhe
  } else if (error instanceof Error) {
    detalhe = error.message
  }

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F4F7F8',
        padding: 40,
      }}
    >
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'rgba(220,38,38,.1)',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 22px',
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          !
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', color: '#0F2225' }}>{titulo}</h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: '#5B6B6E', margin: '0 0 28px' }}>{detalhe}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link
            to="/agenda"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0E7A86',
              color: '#fff',
              borderRadius: 11,
              padding: '12px 22px',
              fontSize: 14.5,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Ir para a Agenda
          </Link>
          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff',
              color: '#33484B',
              border: '1px solid #DCE5E5',
              borderRadius: 11,
              padding: '12px 22px',
              fontSize: 14.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Recarregar
          </button>
        </div>
      </div>
    </div>
  )
}
