import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinic } from '@/context/ClinicContext';
import { useModal } from '@/context/ModalContext';
import { plural } from '@/lib/odontox/format';
import { Search, Plus, Edit } from '@/components/odontox/icons';
import Avatar from '@/components/odontox/Avatar';
import Button from '@/components/odontox/Button';
import type { CSSProperties } from 'react';

const th: CSSProperties = { textAlign: 'left', padding: '13px 20px', fontSize: 12, fontWeight: 700, color: '#94A3A5', letterSpacing: '.5px', textTransform: 'uppercase' };
const td: CSSProperties = { padding: '13px 20px', fontSize: 14, color: '#33484B', fontVariantNumeric: 'tabular-nums' };

export default function PacientesPage() {
  const { patients, consultas } = useClinic();
  const { open } = useModal();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    return patients
      .filter(
        (p) =>
          !q ||
          p.nome.toLowerCase().includes(q) ||
          (qDigits !== '' && p.cpf.replace(/\D/g, '').includes(qDigits)) ||
          (qDigits !== '' && p.telefone.replace(/\D/g, '').includes(qDigits))
      )
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map((p) => ({ ...p, cnt: consultas.filter((c) => c.pacienteId === p.id).length }));
  }, [patients, consultas, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <header style={{ padding: '24px 32px', background: '#fff', borderBottom: '1px solid #E6ECEC', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 23, fontWeight: 800, margin: '0 0 3px', color: '#0F2225' }}>Pacientes</h1>
          <p style={{ fontSize: 14, color: '#5B6B6E', margin: 0 }}>{plural(rows.length, 'paciente cadastrado', 'pacientes cadastrados')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 13, pointerEvents: 'none', display: 'flex' }}><Search color="#94A3A5" /></span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, CPF ou telefone" style={{ width: 300, padding: '11px 14px 11px 38px', border: '1px solid #DCE5E5', borderRadius: 10, fontSize: 14, background: '#fff' }} />
          </div>
          <Button onClick={() => open('patientForm')}><Plus /> Novo paciente</Button>
        </div>
      </header>

      <div className="ox-scroll" style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        <div style={{ background: '#fff', border: '1px solid #E6ECEC', borderRadius: 14, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFBFB', borderBottom: '1px solid #E6ECEC' }}>
                <th style={th}>Paciente</th><th style={th}>CPF</th><th style={th}>Telefone</th><th style={th}>Histórico</th><th style={{ width: 50 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="ox-row" onClick={() => navigate('/paciente/' + p.id)} style={{ borderBottom: '1px solid #F0F4F4', cursor: 'pointer', transition: 'background .12s' }}>
                  <td style={{ padding: '13px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                      <Avatar nome={p.nome} id={p.id} />
                      <div>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1B2B2E' }}>{p.nome}</div>
                        <div style={{ fontSize: 12.5, color: '#94A3A5' }}>{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={td}>{p.cpf}</td>
                  <td style={td}>{p.telefone}</td>
                  <td style={{ ...td, fontSize: 13.5, color: '#5B6B6E' }}>{plural(p.cnt, 'consulta', 'consultas')}</td>
                  <td style={{ padding: '13px 14px', textAlign: 'right' }}>
                    <button onClick={(e) => { e.stopPropagation(); open('patientForm', { entity: p }); }} title="Editar" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3A5', padding: 7, borderRadius: 8, display: 'flex' }}>
                      <Edit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
