import { useClinic } from '@/context/ClinicContext';
import { useModal } from '@/context/ModalContext';
import { Plus } from '@/components/odontox/icons';
import Button from '@/components/odontox/Button';

export default function ProcedimentosPage() {
  const { procedimentos } = useClinic();
  const { open } = useModal();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <header style={{ padding: '24px 32px', background: '#fff', borderBottom: '1px solid #E6ECEC', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 3px', color: '#0F2225' }}>Procedimentos</h1>
          <p style={{ fontSize: 14, color: '#5B6B6E', margin: 0 }}>Catálogo de procedimentos da clínica</p>
        </div>
        <Button onClick={() => open('procedimentoForm')}><Plus /> Novo procedimento</Button>
      </header>

      <div className="ox-scroll" style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(330px,1fr))', gap: 18 }}>
          {procedimentos.map((p) => (
            <div key={p.id} style={{ background: '#fff', border: '1px solid #E6ECEC', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1B2B2E' }}>{p.nome}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, borderTop: '1px solid #F0F4F4', paddingTop: 13 }}>
                <div style={{ fontSize: 13.5, color: '#33484B' }}>Duração: {p.duracaoMinutos} min</div>
                <div style={{ fontSize: 13.5, color: '#33484B' }}>Valor de referência: R$ {p.valorReferencia.toFixed(2)}</div>
              </div>
              <div style={{ display: 'flex', gap: 9 }}>
                <Button variant="ghost" hoverDim={false} style={{ flex: 1, padding: 9, fontSize: 13.5 }} onClick={() => open('procedimentoForm', { entity: p })}>Editar</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}