import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useClinic } from '../context/ClinicContext';
import { useModal } from '../context/ModalContext';
import { shortDate, idade, statusMeta, plural } from '../utils/format';
import { ChevronLeft, Plus, Calendar, AlertTriangle } from '../components/icons';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

export default function PacienteDetalhePage() {
  const { id } = useParams();
  const pid = +id;
  const navigate = useNavigate();
  const { patient, consultas, dentist, atendimentoFor } = useClinic();
  const { open } = useModal();

  const p = patient(pid);

  const history = useMemo(() => {
    if (!p) return [];
    return consultas
      .filter((c) => c.pacienteId === pid)
      .sort((a, b) => (b.date + b.hora).localeCompare(a.date + a.hora))
      .map((c) => ({ consulta: c, dentista: dentist(c.dentistaId), atend: atendimentoFor(c.id) }));
  }, [p, consultas, pid, dentist, atendimentoFor]);

  if (!p) {
    return (
      <div style={{ padding: 40 }}>
        <Button variant="ghost" onClick={() => navigate('/pacientes')}><ChevronLeft /> Voltar</Button>
        <p style={{ marginTop: 20, color: '#5B6B6E' }}>Paciente não encontrado.</p>
      </div>
    );
  }

  const atendidas = consultas.filter((c) => c.pacienteId === pid && c.status === 'atendida').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <header style={{ padding: '18px 32px', background: '#fff', borderBottom: '1px solid #E6ECEC', flex: 'none' }}>
        <button onClick={() => navigate('/pacientes')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'transparent', border: 'none', cursor: 'pointer', color: '#5B6B6E', fontSize: 13.5, fontWeight: 600, padding: 0, marginBottom: 14 }}>
          <ChevronLeft size={16} /> Voltar para pacientes
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Avatar nome={p.nome} id={p.id} size={60} shape="rounded" fontSize={22} />
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px', color: '#0F2225' }}>{p.nome}</h1>
              <div style={{ display: 'flex', gap: 16, fontSize: 13.5, color: '#5B6B6E', flexWrap: 'wrap' }}>
                <span>{idade(p.nascimento)} anos</span><span style={{ color: '#D7E0E0' }}>|</span>
                <span>{plural(consultas.filter((c) => c.pacienteId === pid).length, 'consulta', 'consultas')}</span><span style={{ color: '#D7E0E0' }}>|</span>
                <span>{plural(atendidas, 'atendimento', 'atendimentos')}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" hoverDim={false} onClick={() => open('patientForm', { entity: p })}>Editar cadastro</Button>
            <Button onClick={() => open('consultaForm', { prefill: { pacienteId: p.id } })}>Agendar consulta</Button>
          </div>
        </div>
      </header>

      <div className="ox-scroll" style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start', maxWidth: 1100 }}>
          {/* dados cadastrais */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', border: '1px solid #E6ECEC', borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.5px', color: '#94A3A5', textTransform: 'uppercase', marginBottom: 14 }}>Dados cadastrais</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                <DataItem label="CPF" value={p.cpf} tabular />
                <DataItem label="Data de nascimento" value={shortDate(p.nascimento)} />
                <DataItem label="Telefone" value={p.telefone} />
                <DataItem label="E-mail" value={p.email} breakAll />
              </div>
            </div>
            {p.obs && p.obs.trim() && (
              <div style={{ background: '#FFF8EC', border: '1px solid #F6E2BC', borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: '.5px', color: '#B45309', textTransform: 'uppercase', marginBottom: 9 }}>
                  <AlertTriangle color="#B45309" /> Observações de saúde
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: '#7A5618', margin: 0 }}>{p.obs}</p>
              </div>
            )}
          </div>

          {/* histórico */}
          <div style={{ background: '#fff', border: '1px solid #E6ECEC', borderRadius: 14, padding: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0F2225', marginBottom: 18 }}>Histórico de atendimentos</div>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: '#F0F4F4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Calendar size={24} color="#AEBCBD" /></div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: '#33484B', marginBottom: 4 }}>Sem atendimentos ainda</div>
                <div style={{ fontSize: 13.5, color: '#94A3A5' }}>As consultas e atendimentos deste paciente aparecerão aqui.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {history.map(({ consulta: c, dentista: den, atend: at }) => {
                  const sm = statusMeta(c.status);
                  return (
                    <div key={c.id} style={{ display: 'flex', gap: 14, paddingBottom: 22 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none', paddingTop: 2 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: sm.dot, flex: 'none', marginTop: 5 }} />
                        <div style={{ width: 2, flex: 1, background: '#EDF2F2', marginTop: 6 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                          <span style={{ fontSize: 14.5, fontWeight: 700, color: '#1B2B2E' }}>{c.procedimento}</span>
                          <StatusBadge status={c.status} />
                        </div>
                        <div style={{ fontSize: 13, color: '#5B6B6E', marginBottom: 8 }}>{shortDate(c.date)} · {c.hora} · {den ? den.nome : '—'}</div>
                        {at ? (
                          <div style={{ background: '#F6FAFA', border: '1px solid #E6ECEC', borderRadius: 10, padding: '13px 15px' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#0E7A86', marginBottom: 5 }}>Procedimento realizado</div>
                            <div style={{ fontSize: 13.5, color: '#1B2B2E', marginBottom: 9 }}>{at.procedimento_realizado}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3A5', marginBottom: 3 }}>Observações clínicas</div>
                            <div style={{ fontSize: 13.5, color: '#33484B', lineHeight: 1.5 }}>{at.observacoes_clinicas}</div>
                          </div>
                        ) : c.status === 'atendida' ? (
                          <button onClick={() => open('atendimentoForm', { consultaId: c.id })} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'transparent', border: '1px dashed #BCD6D6', borderRadius: 9, padding: '8px 13px', fontSize: 13, fontWeight: 600, color: '#0E7A86', cursor: 'pointer', marginTop: 2 }}>
                            <Plus size={14} /> Registrar atendimento
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DataItem({ label, value, tabular, breakAll }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#94A3A5', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14.5, fontWeight: 600, color: '#1B2B2E', fontVariantNumeric: tabular ? 'tabular-nums' : 'normal', wordBreak: breakAll ? 'break-all' : 'normal' }}>{value}</div>
    </div>
  );
}
