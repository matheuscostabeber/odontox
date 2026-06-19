import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import BrandPanel from '../components/BrandPanel';
import { ACCENT, CLINIC_NAME, USER } from '../utils/constants';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(USER.email);
  const [pass, setPass] = useState('demo1234');

  const doLogin = (e) => {
    e.preventDefault();
    login();
    navigate('/agenda');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', background: '#F4F7F8' }}>
      <BrandPanel />

      {/* painel do formulário */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <form onSubmit={doLogin} style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', color: '#0F2225' }}>Entrar no sistema</h2>
          <p style={{ fontSize: 15, color: '#5B6B6E', margin: '0 0 32px' }}>Acesso restrito à equipe da {CLINIC_NAME}.</p>

          <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#33484B', marginBottom: 7 }}>E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@clinica.com" style={{ width: '100%', padding: '13px 15px', border: '1px solid #DCE5E5', borderRadius: 11, fontSize: 15, background: '#fff', marginBottom: 18, color: '#1B2B2E' }} />

          <label style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#33484B', marginBottom: 7 }}>Senha</label>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '13px 15px', border: '1px solid #DCE5E5', borderRadius: 11, fontSize: 15, background: '#fff', marginBottom: 10, color: '#1B2B2E' }} />

          <div style={{ textAlign: 'right', marginBottom: 24 }}>
            <Link to="/esqueci-senha" style={{ fontSize: 13, color: ACCENT, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>Esqueci minha senha</Link>
          </div>

          <button type="submit" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: ACCENT, color: '#fff', border: 'none', borderRadius: 11, padding: 14, fontSize: 15.5, fontWeight: 700, cursor: 'pointer', letterSpacing: '.2px' }}>Entrar</button>
          <p style={{ fontSize: 12.5, textAlign: 'center', margin: '22px 0 0', color: '#94A3A5' }}>Ambiente de demonstração — clique em Entrar para explorar.</p>
        </form>
      </div>
    </div>
  );
}
