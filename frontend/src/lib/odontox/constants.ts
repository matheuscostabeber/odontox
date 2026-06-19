// Constantes globais da agenda e da clínica
import type { StatusConsulta } from '@/lib/types'

export const TODAY = '2026-06-17' // data "atual" do ambiente de demonstração
export const CLINIC_NAME = 'Clínica OdontoX'
export const ACCENT = '#0E7A86'
export const USER = { nome: 'Administrador OdontoX', iniciais: 'AO', email: 'odontox@ifes.site' }

// Grade da agenda (em horas)
export const START_H = 8
export const END_H = 19
export const HOUR_H = 72 // altura de 1 hora em px

export const DURACAO_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1h30' },
  { value: 120, label: '2 horas' },
]

export const STATUS_OPTIONS: { value: StatusConsulta; label: string }[] = [
  { value: 'agendada', label: 'Agendada' },
  { value: 'atendida', label: 'Atendida' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'ausente', label: 'Ausente' },
]
