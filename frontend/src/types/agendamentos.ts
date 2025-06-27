export interface Agendamento {
  id: number
  pacienteId: number
  parceiroId: number
  servicoId: number
  salaId: number | null
  data: string
  dataAgendamento?: string // Para compatibilidade com backend
  horaInicio: string
  horaFim: string
  duracaoMinutos: number
  status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'nao_compareceu'
  valorServico: number
  valorParceiro: number | null
  valorPago: boolean
  observacoes: string | null
  observacoesInternas: string | null
  primeiraConsulta: boolean
  requerPreparo: boolean
  instrucoesPreparo: string | null
  horaChegada: string | null
  horaInicioReal: string | null
  horaFimReal: string | null
  agendamentoOriginalId: number | null
  motivoCancelamento: string | null
  lembreteEnviado: boolean
  dataLembrete: string | null
  createdBy: number | null
  updatedBy: number | null
  createdAt: string
  updatedAt: string
  
  // Relacionamentos
  paciente?: {
    id: number
    nome: string
    email: string
    telefone: string
    cpf: string
  }
  parceiro?: {
    id: number
    nome: string
    especialidades: string[]
    telefoneContato: string
    email: string
    disponibilidade?: DisponibilidadeParceiro
    servicosHabilitados?: number[]
  }
  servico?: {
    id: number
    nome: string
    descricao: string
    categoria: string
    precoVenda: number
    duracaoMinutos: number
  }
  sala?: {
    id: number
    nome: string
    descricao: string
  }
}

export interface AgendamentoFormData {
  pacienteId: number
  parceiroId: number
  servicoId: number
  salaId: number
  data: string
  horaInicio: string
  horaFim?: string
  duracaoMinutos: number
  valorServico?: number
  valorParceiro?: number
  observacoes?: string
  observacoesInternas?: string
  primeiraConsulta?: boolean
  requerPreparo?: boolean
  instrucoesPreparo?: string
  status?: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'nao_compareceu'
}

export interface AgendamentoFilters {
  search?: string
  status?: string
  parceiroId?: number
  salaId?: number
  pacienteId?: number
  dataInicio?: string
  dataFim?: string
  page?: number
  limit?: number
}

export interface AgendamentosResponse {
  success: boolean
  data: {
    data: Agendamento[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
      firstPage: number
      firstPageUrl: string
      lastPageUrl: string
      nextPageUrl: string | null
      previousPageUrl: string | null
    }
  }
}

export interface AgendamentoResponse {
  success: boolean
  data: Agendamento
  message?: string
}

export interface DisponibilidadeRequest {
  parceiroId: number
  data: string
  horaInicio: string
  duracaoMinutos: number
  agendamentoIdExcluir?: number
}

export interface DisponibilidadeResponse {
  success: boolean
  data: {
    disponivel: boolean
    horarios?: string[]
  }
}

// Interface para disponibilidade do parceiro por dia da semana
export interface DisponibilidadeParceiro {
  segunda?: DisponibilidadeDia
  terca?: DisponibilidadeDia
  quarta?: DisponibilidadeDia
  quinta?: DisponibilidadeDia
  sexta?: DisponibilidadeDia
  sabado?: DisponibilidadeDia
  domingo?: DisponibilidadeDia
}

export interface DisponibilidadeDia {
  ativo: boolean
  horarios: HorarioDisponivel[]
}

export interface HorarioDisponivel {
  inicio: string
  fim: string
}

export interface EventoCalendario {
  id: number
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  extendedProps: Agendamento
}

export interface CalendarioResponse {
  success: boolean
  data: EventoCalendario[]
}

export interface EstatisticasAgendamento {
  total: number
  agendados: number
  confirmados: number
  concluidos: number
  cancelados: number
  naoCompareceu: number
  faturamento: number
  taxaConclusao: number
  taxaCancelamento: number
}

export interface EstatisticasResponse {
  success: boolean
  data: EstatisticasAgendamento
}

export const STATUS_AGENDAMENTO = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  nao_compareceu: 'Não Compareceu'
} as const

export const STATUS_COLORS = {
  agendado: 'primary',
  confirmado: 'emerald',
  em_andamento: 'amber',
  concluido: 'green',
  cancelado: 'red',
  nao_compareceu: 'gray'
} as const

export interface Sala {
  id: number
  nome: string
  cor: string
}

export interface Parceiro {
  id: number
  nome: string
  email: string
  telefoneContato: string
  especialidades: string[]
  disponibilidade?: DisponibilidadeParceiro
  servicosHabilitados?: number[]
  ativo: boolean
} 