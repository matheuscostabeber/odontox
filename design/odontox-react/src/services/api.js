// Camada de serviço — API fictícia assíncrona.
// Lê os dados-semente em JSON, mantém estado em memória e simula latência de rede.
// Substitua o corpo destas funções por chamadas fetch() reais para plugar um backend.
import seedDentists from '../data/dentists.json';
import seedPatients from '../data/patients.json';
import seedConsultas from '../data/consultas.json';
import seedAtendimentos from '../data/atendimentos.json';
import { TODAY } from '../utils/constants';

// clones para não mutar os imports
let dentists = structuredClone(seedDentists);
let patients = structuredClone(seedPatients);
let consultas = structuredClone(seedConsultas);
let atendimentos = structuredClone(seedAtendimentos);

const LATENCY = 220; // ms — simula a rede
const delay = (data) => new Promise((res) => setTimeout(() => res(structuredClone(data)), LATENCY));
const nextId = (list) => Math.max(0, ...list.map((x) => x.id)) + 1;
const NEW_CORS = ['#0E7A86', '#2563EB', '#7C3AED', '#C2410C', '#0891B2', '#15803D'];

export const api = {
  // ---- carga inicial ----
  getAll() {
    return delay({ dentists, patients, consultas, atendimentos });
  },

  // ---- consultas ----
  createConsulta(data) {
    const reg = { ...data, id: nextId(consultas), procedimento: data.procedimento || 'Consulta' };
    consultas = [...consultas, reg];
    return delay(reg);
  },
  updateConsulta(id, patch) {
    consultas = consultas.map((c) => (c.id === id ? { ...c, ...patch } : c));
    return delay(consultas.find((c) => c.id === id));
  },
  setConsultaStatus(id, status) {
    return this.updateConsulta(id, { status });
  },

  // ---- pacientes ----
  createPatient(data) {
    const reg = { ...data, id: nextId(patients) };
    patients = [...patients, reg];
    return delay(reg);
  },
  updatePatient(id, patch) {
    patients = patients.map((p) => (p.id === id ? { ...p, ...patch } : p));
    return delay(patients.find((p) => p.id === id));
  },

  // ---- dentistas ----
  createDentist(data) {
    const id = nextId(dentists);
    const reg = { ...data, id, cor: NEW_CORS[id % NEW_CORS.length] };
    dentists = [...dentists, reg];
    return delay(reg);
  },
  updateDentist(id, patch) {
    dentists = dentists.map((d) => (d.id === id ? { ...d, ...patch } : d));
    return delay(dentists.find((d) => d.id === id));
  },
  toggleDentist(id) {
    const d = dentists.find((x) => x.id === id);
    return this.updateDentist(id, { ativo: !d.ativo });
  },

  // ---- atendimentos ----
  // cria/atualiza o registro clínico e marca a consulta como atendida
  saveAtendimento(consultaId, data, existingId) {
    if (existingId) {
      atendimentos = atendimentos.map((a) =>
        a.id === existingId ? { ...a, ...data } : a
      );
    } else {
      atendimentos = [...atendimentos, { ...data, id: nextId(atendimentos), consultaId, registrado_em: TODAY }];
    }
    consultas = consultas.map((c) => (c.id === consultaId ? { ...c, status: 'atendida' } : c));
    return delay({ atendimentos, consulta: consultas.find((c) => c.id === consultaId) });
  },
};
