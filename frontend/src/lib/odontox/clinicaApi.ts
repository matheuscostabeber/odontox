// Cliente de domínio da clínica OdontoX, sobre o cliente HTTP central (@/lib/api).
// Caminhos relativos a /api (o prefixo é adicionado pelo cliente central).
import { api } from '@/lib/api'
import type { Atendimento, Consulta, Dentista, Paciente, StatusConsulta } from '@/lib/types'

export interface DadosClinica {
  dentists: Dentista[]
  patients: Paciente[]
  consultas: Consulta[]
  atendimentos: Atendimento[]
}

export interface ConsultaPayload {
  pacienteId: number
  dentistaId: number
  date: string
  hora: string
  duracao: number
  procedimento: string
  status: StatusConsulta
  obs: string
}

export interface AtendimentoData {
  procedimento_realizado: string
  observacoes_clinicas: string
}

export interface SaveAtendimentoResult {
  atendimentos: Atendimento[]
  consulta: Consulta
}

export const clinicaApi = {
  // ---- carga inicial ----
  getAll: () => api.get<DadosClinica>('/clinica/dados'),

  // ---- consultas ----
  createConsulta: (payload: ConsultaPayload) => api.post<Consulta>('/consultas', payload),
  updateConsulta: (id: number, payload: ConsultaPayload) => api.put<Consulta>('/consultas/' + id, payload),
  setConsultaStatus: (id: number, status: StatusConsulta) =>
    api.patch<Consulta>('/consultas/' + id + '/status', { status }),

  // ---- pacientes ----
  createPatient: (f: Partial<Paciente>) => api.post<Paciente>('/pacientes', f),
  updatePatient: (id: number, f: Partial<Paciente>) => api.put<Paciente>('/pacientes/' + id, f),

  // ---- dentistas ----
  createDentist: (f: Partial<Dentista>) => api.post<Dentista>('/dentistas', f),
  updateDentist: (id: number, f: Partial<Dentista>) => api.put<Dentista>('/dentistas/' + id, f),
  toggleDentist: (id: number) => api.patch<Dentista>('/dentistas/' + id + '/toggle'),

  // ---- atendimentos ----
  saveAtendimento: (consultaId: number, data: AtendimentoData, existingId?: number) =>
    existingId
      ? api.put<SaveAtendimentoResult>('/atendimentos/' + existingId, data)
      : api.post<SaveAtendimentoResult>('/atendimentos', { consultaId, ...data }),
}

// Alias para manter compatibilidade com o nome usado no ClinicContext do design.
export const api_clinica = clinicaApi
