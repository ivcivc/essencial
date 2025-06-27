import { z } from 'zod'

// Schema para criação de agendamento (com validação de horário futuro)
export const agendamentoFormSchema = z.object({
  pacienteId: z.number({
    required_error: 'Paciente é obrigatório',
    invalid_type_error: 'Paciente deve ser um número'
  }).min(1, 'Paciente é obrigatório'),
  
  parceiroId: z.number({
    required_error: 'Parceiro é obrigatório',
    invalid_type_error: 'Parceiro deve ser um número'
  }).min(1, 'Parceiro é obrigatório'),
  
  servicoId: z.number({
    required_error: 'Serviço é obrigatório',
    invalid_type_error: 'Serviço deve ser um número'
  }).min(1, 'Serviço é obrigatório'),
  
  salaId: z.number({
    required_error: 'Sala é obrigatória',
    invalid_type_error: 'Sala deve ser um número'
  }).min(1, 'Sala é obrigatória'),
  
  data: z.string({
    required_error: 'Data do agendamento é obrigatória'
  }).min(1, 'Data do agendamento é obrigatória'),
  
  horaInicio: z.string({
    required_error: 'Hora de início é obrigatória'
  }).min(1, 'Hora de início é obrigatória')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),

  horaFim: z.string().optional(),
  
  duracaoMinutos: z.number({
    required_error: 'Duração é obrigatória',
    invalid_type_error: 'Duração deve ser um número'
  }).min(15, 'Duração mínima é de 15 minutos')
    .max(480, 'Duração máxima é de 8 horas'),
  
  valorServico: z.number().optional(),
  valorParceiro: z.number().optional(),
  
  observacoes: z.string().optional(),
  observacoesInternas: z.string().optional(),
  
  primeiraConsulta: z.boolean().optional().default(false),
  requerPreparo: z.boolean().optional().default(false),
  
  instrucoesPreparo: z.string().optional()
}).refine((data) => {
  // Validação combinada de data e hora
  const dataHoraAgendamento = new Date(`${data.data}T${data.horaInicio}:00`)
  const agora = new Date()
  
  return dataHoraAgendamento > agora
}, {
  message: 'Agendamentos podem ser feitos para hoje em horários futuros',
  path: ['data'] // Mostra o erro no campo data
})

// Schema para edição de agendamento (SEM validação de horário futuro)
export const agendamentoEditSchema = z.object({
  pacienteId: z.number({
    required_error: 'Paciente é obrigatório',
    invalid_type_error: 'Paciente deve ser um número'
  }).min(1, 'Paciente é obrigatório'),
  
  parceiroId: z.number({
    required_error: 'Parceiro é obrigatório',
    invalid_type_error: 'Parceiro deve ser um número'
  }).min(1, 'Parceiro é obrigatório'),
  
  servicoId: z.number({
    required_error: 'Serviço é obrigatório',
    invalid_type_error: 'Serviço deve ser um número'
  }).min(1, 'Serviço é obrigatório'),
  
  salaId: z.number({
    required_error: 'Sala é obrigatória',
    invalid_type_error: 'Sala deve ser um número'
  }).min(1, 'Sala é obrigatória'),
  
  data: z.string({
    required_error: 'Data do agendamento é obrigatória'
  }).min(1, 'Data do agendamento é obrigatória'),
  
  horaInicio: z.string({
    required_error: 'Hora de início é obrigatória'
  }).min(1, 'Hora de início é obrigatória')
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),

  horaFim: z.string().optional(),
  
  duracaoMinutos: z.number({
    required_error: 'Duração é obrigatória',
    invalid_type_error: 'Duração deve ser um número'
  }).min(15, 'Duração mínima é de 15 minutos')
    .max(480, 'Duração máxima é de 8 horas'),
  
  valorServico: z.number().optional(),
  valorParceiro: z.number().optional(),
  
  observacoes: z.string().optional(),
  observacoesInternas: z.string().optional(),
  
  primeiraConsulta: z.boolean().optional().default(false),
  requerPreparo: z.boolean().optional().default(false),
  
  instrucoesPreparo: z.string().optional(),
  status: z.string().optional()
})
// ⚠️ NOTA: agendamentoEditSchema NÃO tem validação de horário futuro
// Isso permite editar agendamentos passados para correções

// Schema para filtros de busca
export const agendamentoFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'nao_compareceu']).optional(),
  parceiroId: z.number().optional(),
  salaId: z.number().optional(),
  pacienteId: z.number().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10)
})

// Schema para verificação de disponibilidade
export const disponibilidadeSchema = z.object({
  parceiroId: z.number({
    required_error: 'Parceiro é obrigatório'
  }).min(1, 'Parceiro é obrigatório'),
  
  data: z.string({
    required_error: 'Data é obrigatória'
  }).min(1, 'Data é obrigatória'),
  
  horaInicio: z.string({
    required_error: 'Hora de início é obrigatória'
  }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  
  duracaoMinutos: z.number({
    required_error: 'Duração é obrigatória'
  }).min(15, 'Duração mínima é de 15 minutos')
})

// Schema para cancelamento
export const cancelamentoSchema = z.object({
  motivo: z.string().optional()
})

// Schema para estatísticas
export const estatisticasSchema = z.object({
  dataInicio: z.string({
    required_error: 'Data de início é obrigatória'
  }).min(1, 'Data de início é obrigatória'),
  
  dataFim: z.string({
    required_error: 'Data de fim é obrigatória'
  }).min(1, 'Data de fim é obrigatória')
}).refine((data) => {
  const inicio = new Date(data.dataInicio)
  const fim = new Date(data.dataFim)
  return inicio <= fim
}, {
  message: 'Data de início deve ser anterior ou igual à data de fim',
  path: ['dataFim']
})

// Schema para calendário
export const calendarioSchema = z.object({
  dataInicio: z.string({
    required_error: 'Data de início é obrigatória'
  }),
  
  dataFim: z.string({
    required_error: 'Data de fim é obrigatória'
  }),
  
  parceiroId: z.number().optional()
})

// Tipos derivados dos schemas
export type AgendamentoFormData = z.infer<typeof agendamentoFormSchema>
export type AgendamentoEditData = z.infer<typeof agendamentoEditSchema>
export type AgendamentoFilters = z.infer<typeof agendamentoFiltersSchema>
export type DisponibilidadeRequest = z.infer<typeof disponibilidadeSchema>
export type CancelamentoRequest = z.infer<typeof cancelamentoSchema>
export type EstatisticasRequest = z.infer<typeof estatisticasSchema>
export type CalendarioRequest = z.infer<typeof calendarioSchema> 