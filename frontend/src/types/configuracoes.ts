export interface ConfiguracaoSistema {
  id: number
  chave: string
  valor: any
  descricao: string | null
  categoria: string
  editavel: boolean
  createdBy: number | null
  updatedBy: number | null
  createdAt: string
  updatedAt: string
}

export interface PeriodoFuncionamento {
  inicio: string
  fim: string
}

export interface DiaFuncionamento {
  ativo: boolean
  periodos: PeriodoFuncionamento[]
}

export interface HorariosFuncionamento {
  segunda: DiaFuncionamento
  terca: DiaFuncionamento
  quarta: DiaFuncionamento
  quinta: DiaFuncionamento
  sexta: DiaFuncionamento
  sabado: DiaFuncionamento
  domingo: DiaFuncionamento
}

export interface ConfiguracaoAgendamentos {
  intervaloSlots: number // minutos
  antecedenciaMinima: number // minutos
  antecedenciaMaxima: number // dias
  permitirAgendamentoPassado: boolean
  toleranciaEdicaoPassado: number // minutos
}

export interface DadosClinica {
  nome: string
  cnpj: string
  telefone: string
  whatsapp: string
  email: string
  endereco: {
    cep: string
    rua: string
    numero: string
    complemento: string
    bairro: string
    cidade: string
    estado: string
  }
}

export interface ConfiguracaoNotificacoes {
  whatsappAtivo: boolean
  emailAtivo: boolean
  smsAtivo: boolean
  lembreteAgendamento: {
    ativo: boolean
    antecedenciaHoras: number
    mensagem: string
  }
  confirmacaoAgendamento: {
    ativo: boolean
    mensagem: string
  }
}

export interface GerarHorariosRequest {
  data: string
  intervaloCustom?: number
  parceiroId?: number
}

export interface GerarHorariosResponse {
  success: boolean
  data: string[]
  message?: string
} 