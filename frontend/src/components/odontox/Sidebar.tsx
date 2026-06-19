import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { Calendar, Users, Tooth, LogOut } from './icons'
import { useAuthStore } from '@/store/authStore'
import { ACCENT, CLINIC_NAME, USER } from '@/lib/odontox/constants'

const NAV = [
  { to: '/agenda', label: 'Agenda', Icon: Calendar },
  { to: '/pacientes', label: 'Pacientes', Icon: Users, match: ['/pacientes', '/paciente'] },
  { to: '/dentistas', label: 'Dentistas', Icon: Tooth },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const logout = async () => {
    await useAuthStore.getState().logout()
    navigate('/login')
  }

  return (
    <aside style={{ width: 250, flex: 'none', background: '#0C2B2F', display: 'flex', flexDirection: 'column', padding: '22px 16px' }}>
      <div style={{ padding: '4px 8px 22px' }}>
        <Logo markBg={ACCENT} markColor="#fff" />
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'rgba(233,242,242,.4)', padding: '6px 10px 10px' }}>MENU</div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {NAV.map(({ to, label, Icon, match }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => {
              // NavLink re-renderiza a cada navegação; computa o destaque aqui
              // para que /paciente/:id também acenda "Pacientes".
              const active = match ? match.some((m) => pathname.startsWith(m)) : isActive
              return {
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10,
                cursor: 'pointer', fontSize: 14.5, fontWeight: 600, textDecoration: 'none',
                background: active ? ACCENT : 'transparent',
                color: active ? '#fff' : 'rgba(233,242,242,.72)',
                transition: 'background .15s',
              }
            }}
          >
            <Icon /> {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '6px 8px' }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#163E43', color: '#7BD3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flex: 'none' }}>{USER.iniciais}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{USER.nome}</div>
            <div style={{ fontSize: 12, color: 'rgba(233,242,242,.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{CLINIC_NAME}</div>
          </div>
          <button onClick={logout} title="Sair" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(233,242,242,.5)', padding: 6, display: 'flex' }}>
            <LogOut />
          </button>
        </div>
      </div>
    </aside>
  )
}
