import { useClinic } from '@/context/ClinicContext';
import { useModal } from '@/context/ModalContext';
import { Plus, Pencil } from '@/components/odontox/icons';
import Button from '@/components/odontox/Button';

export default function EspecialidadesPage() {
  const { especialidades } = useClinic();
  const { open } = useModal();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <header style={{ padding: '24px 32px', background: '#fff', borderBottom: '1px solid #E6ECEC', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 3px', color: '#0F2225' }}>Especialidades</h1>
          <p style={{ fontSize: 14, color: '#5B6B6E', margin: 0 }}>Lista usada no cadastro de dentistas</p>
        </div>
        <Button onClick={() => open('especialidadeForm')}><Plus /> Nova especialidade</Button>
      </header>

      <div className="ox-scroll" style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        {especialidades.length === 0 ? (
          <p style={{ fontSize: 14, color: '#94A3A5' }}>Nenhuma especialidade cadastrada ainda.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {especialidades.map((e) => (
              <div key={e.id} style={{ background: '#fff', border: '1px solid #E6ECEC', borderRadius: 14, padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1B2B2E' }}>{e.nome}</span>
                <Button variant="ghost" hoverDim={false} style={{ padding: 9, fontSize: 13.5 }} onClick={() => open('especialidadeForm', { entity: e })}><Pencil /> Editar</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}