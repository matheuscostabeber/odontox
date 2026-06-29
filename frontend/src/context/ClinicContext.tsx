// Estado global da clínica: dados + ações CRUD, sobre a camada de serviço.
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { clinicaApi as api } from '@/lib/odontox/clinicaApi'
import type { AtendimentoData } from '@/lib/odontox/clinicaApi'
import type { Atendimento, Consulta, Dentista, Especialidade, Paciente, StatusConsulta } from '@/lib/types'

interface ClinicData {
  dentists: Dentista[]
  especialidades: Especialidade[]
  patients: Paciente[]
  consultas: Consulta[]
  atendimentos: Atendimento[]
}

// Forma do formulário de consulta na UI (espelha o design original).
export interface ConsultaForm {
  id?: number
  pacienteId: number | string | undefined
  dentistaId: number | string | undefined
  data: string
  hora: string
  duracao: number | string
  procedimento: string
  status: StatusConsulta
  observacoes: string
}

// Forma do formulário de atendimento na UI.
export interface AtendimentoForm {
  procedimento_realizado: string
  observacoes_clinicas: string
}

interface ClinicContextValue extends ClinicData {
  loading: boolean
  dentist: (id: number) => Dentista | undefined
  patient: (id: number) => Paciente | undefined
  atendimentoFor: (consultaId: number) => Atendimento | undefined
  saveConsulta: (form: ConsultaForm) => Promise<void>
  setConsultaStatus: (id: number, status: StatusConsulta) => Promise<void>
  savePatient: (form: Partial<Paciente> & { id?: number }) => Promise<void>
  saveDentist: (form: Partial<Dentista> & { id?: number }) => Promise<void>
  toggleDentist: (id: number) => Promise<void>
  saveEspecialidade: (form: Partial<Especialidade> & { id?: number }) => Promise<void>
  saveAtendimento: (consultaId: number, form: AtendimentoForm, existingId?: number) => Promise<void>
}

const ClinicContext = createContext<ClinicContextValue | null>(null)

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ClinicData>({ dentists: [], especialidades: [], patients: [], consultas: [], atendimentos: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    api.getAll().then((d) => {
      if (alive) {
        setData(d)
        setLoading(false)
      }
    })
    return () => {
      alive = false
    }
  }, [])

  // ---- seletores ----
  const dentist = useCallback((id: number) => data.dentists.find((d) => d.id === id), [data.dentists])
  const patient = useCallback((id: number) => data.patients.find((p) => p.id === id), [data.patients])
  const atendimentoFor = useCallback(
    (consultaId: number) => data.atendimentos.find((a) => a.consultaId === consultaId),
    [data.atendimentos]
  )

  // ---- consultas ----
  const saveConsulta = useCallback(async (form: ConsultaForm) => {
    const payload = {
      pacienteId: Number(form.pacienteId),
      dentistaId: Number(form.dentistaId),
      date: form.data,
      hora: form.hora,
      duracao: +form.duracao,
      procedimento: form.procedimento,
      status: form.status,
      obs: form.observacoes,
    }
    if (form.id) {
      const updated = await api.updateConsulta(form.id, payload)
      setData((d) => ({ ...d, consultas: d.consultas.map((c) => (c.id === form.id ? updated : c)) }))
    } else {
      const created = await api.createConsulta(payload)
      setData((d) => ({ ...d, consultas: [...d.consultas, created] }))
    }
  }, [])

  const setConsultaStatus = useCallback(async (id: number, status: StatusConsulta) => {
    const updated = await api.setConsultaStatus(id, status)
    setData((d) => ({ ...d, consultas: d.consultas.map((c) => (c.id === id ? updated : c)) }))
  }, [])

  // ---- pacientes ----
  const savePatient = useCallback(async (form: Partial<Paciente> & { id?: number }) => {
    if (form.id) {
      const updated = await api.updatePatient(form.id, form)
      setData((d) => ({ ...d, patients: d.patients.map((p) => (p.id === form.id ? updated : p)) }))
    } else {
      const created = await api.createPatient(form)
      setData((d) => ({ ...d, patients: [...d.patients, created] }))
    }
  }, [])

  // ---- dentistas ----
  const saveDentist = useCallback(async (form: Partial<Dentista> & { id?: number }) => {
    if (form.id) {
      const updated = await api.updateDentist(form.id, form)
      setData((d) => ({ ...d, dentists: d.dentists.map((x) => (x.id === form.id ? updated : x)) }))
    } else {
      const created = await api.createDentist(form)
      setData((d) => ({ ...d, dentists: [...d.dentists, created] }))
    }
  }, [])

  const toggleDentist = useCallback(async (id: number) => {
    const updated = await api.toggleDentist(id)
    setData((d) => ({ ...d, dentists: d.dentists.map((x) => (x.id === id ? updated : x)) }))
  }, [])

  // ---- especialidades ----
  const saveEspecialidade = useCallback(async (form: Partial<Especialidade> & { id?: number }) => {
    if (form.id) {
      const updated = await api.updateEspecialidade(form.id, form)
      setData((d) => ({ ...d, especialidades: d.especialidades.map((x) => (x.id === form.id ? updated : x)) }))
    } else {
      const created = await api.createEspecialidade(form)
      setData((d) => ({ ...d, especialidades: [...d.especialidades, created] }))
    }
  }, [])


  // ---- atendimentos ----
  const saveAtendimento = useCallback(
    async (consultaId: number, form: AtendimentoForm, existingId?: number) => {
      const payload: AtendimentoData = {
        procedimento_realizado: form.procedimento_realizado,
        observacoes_clinicas: form.observacoes_clinicas,
      }
      const res = await api.saveAtendimento(consultaId, payload, existingId)
      setData((d) => ({
        ...d,
        atendimentos: res.atendimentos,
        consultas: d.consultas.map((c) => (c.id === consultaId ? res.consulta : c)),
      }))
    },
    []
  )

  const value: ClinicContextValue = {
    ...data,
    loading,
    dentist,
    patient,
    atendimentoFor,
    saveConsulta,
    setConsultaStatus,
    savePatient,
    saveDentist,
    toggleDentist,
    saveEspecialidade,
    saveAtendimento,
  }

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>
}

export function useClinic(): ClinicContextValue {
  const ctx = useContext(ClinicContext)
  if (!ctx) throw new Error('useClinic precisa estar dentro de <ClinicProvider>')
  return ctx
}
