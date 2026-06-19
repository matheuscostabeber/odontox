import { Logo } from './Logo';
import { Check } from './icons';
import { ACCENT } from '@/lib/odontox/constants';

const FEATURES = [
  'Agenda diária por profissional',
  'Cadastro de pacientes e dentistas',
  'Registro e histórico de atendimentos',
];

// Painel de marca lateral, compartilhado entre Login e Recuperação de senha.
export default function BrandPanel() {
  return (
    <div style={{ width: '46%', background: 'linear-gradient(150deg,#0C2B2F 0%,#0E5159 60%,#0E7A86 130%)', color: '#fff', padding: '56px 56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Logo markBg="#fff" markColor={ACCENT} textColor="#fff" xColor="rgba(255,255,255,.7)" fontSize={21} />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: 'rgba(255,255,255,.55)', marginBottom: 16 }}>SISTEMA DE GESTÃO ODONTOLÓGICA</div>
        <h1 style={{ fontSize: 38, lineHeight: 1.15, fontWeight: 800, margin: '0 0 18px', maxWidth: 420, textWrap: 'balance' }}>A agenda da sua clínica, sob controle.</h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,.78)', margin: 0, maxWidth: 400 }}>Substitua a agenda física por um controle digital de consultas, pacientes e atendimentos — tudo em um só lugar.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 34 }}>
          {FEATURES.map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: 'rgba(255,255,255,.9)' }}>
              <Check size={20} color="#7BD3D0" /> {f}
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', position: 'relative', zIndex: 1 }}>© 2026 OdontoX · Versão MVP</div>
      <div style={{ position: 'absolute', right: -120, bottom: -120, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,.08),transparent 70%)' }} />
    </div>
  );
}
