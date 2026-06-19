// Tipos TypeScript espelhando os schemas de resposta do backend (dtos/responses/).
// Enums são strings de valor (ex: "agendada", "Administrador"), nunca índices.

// ===== Enums de domínio =====
export const Perfil = {
  ADMIN: 'Administrador',
  CLIENTE: 'Cliente',
  VENDEDOR: 'Vendedor',
} as const
export type PerfilValor = (typeof Perfil)[keyof typeof Perfil]

// ===== Comuns =====
export interface MensagemResponse {
  message: string
}
export interface TokenCsrfResponse {
  token: string
}
export interface PaginaResponse<T> {
  items: T[]
  pagina: number
  por_pagina: number
  total: number
  total_paginas: number
}

// ===== Usuário =====
export interface Usuario {
  id: number
  nome: string
  email: string
  perfil: string
  foto_url: string
  data_cadastro?: string | null
  data_atualizacao?: string | null
}

// ===== OdontoX — domínio da clínica =====
export type StatusConsulta = 'agendada' | 'atendida' | 'cancelada' | 'ausente'

export interface Dentista {
  id: number
  nome: string
  cro: string
  especialidade: string
  telefone: string
  email: string
  ativo: boolean
  cor: string
  fotoUrl?: string | null
}

export interface Paciente {
  id: number
  nome: string
  cpf: string
  nascimento: string
  telefone: string
  email: string
  obs: string
}

export interface Consulta {
  id: number
  date: string
  hora: string
  duracao: number
  pacienteId: number
  dentistaId: number
  procedimento: string
  status: StatusConsulta
  obs: string
}

export interface Atendimento {
  id: number
  consultaId: number
  procedimento_realizado: string
  observacoes_clinicas: string
  registrado_em: string
}
