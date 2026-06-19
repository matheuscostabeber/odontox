import { useClinic } from '../context/ClinicContext';
import { useModal } from '../context/ModalContext';
import { Plus, Phone, Mail } from '../components/icons';
import Avatar from '../components/Avatar';
import Button from '../components/Button';

export default function DentistasPage() {
  const { dentists, toggleDentist } = useClinic();
  const { open } = useModal();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <header style={{ padding: '24px 32px', background: '#fff', borderBottom: '1px solid #E6ECEC', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 3px', color: '#0F2225' }}>Dentistas</h1>
          <p style={{ fontSize: 14, color: '#5B6B6E', margin: 0 }}>Profissionais que aparecem na agenda</p>
        </div>
        <Button onClick={() => open('dentistForm')}><Plus /> Novo dentista</Button>
      </header>

      <div className="ox-scroll" style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(330px,1fr))', gap: 18 }}>
          {dentists.map((d) => (
            <div key={d.id} style={{ background: '#fff', border: '1px solid #E6ECEC', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, opacity: d.ativo ? 1 : 0.78 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <Avatar nome={d.nome} color={d.ativo ? d.cor : '#AEBCBD'} size={46} shape="rounded" fontSize={16} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 2 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1B2B2E' }}>{d.nome}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: d.ativo ? '#E6F6EE' : '#F0F2F2', color: d.ativo ? '#047857' : '#7C8A8C' }}>{d.ativo ? 'Ativo' : 'Inativo'}</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0E7A86' }}>{d.especialidade}</div>
                  <div style={{ fontSize: 12.5, color: '#94A3A5', marginTop: 1 }}>{d.cro}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, borderTop: '1px solid #F0F4F4', paddingTop: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, color: '#33484B' }}><Phone color="#94A3A5" /> {d.telefone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, color: '#33484B' }}><Mail color="#94A3A5" /> {d.email}</div>
              </div>
              <div style={{ display: 'flex', gap: 9 }}>
                <Button variant="ghost" hoverDim={false} style={{ flex: 1, padding: 9, fontSize: 13.5 }} onClick={() => open('dentistForm', { entity: d })}>Editar</Button>
                <Button variant="outline" hoverDim={false} style={{ flex: 1, padding: 9, fontSize: 13.5 }} onClick={() => toggleDentist(d.id)}>{d.ativo ? 'Desativar' : 'Ativar'}</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
