import { z } from 'zod';
import { parseMoney, isValidCPFCNPJ } from '../utils/formatters';

// Schema para disponibilidade de um dia
const diaDisponibilidadeSchema = z.object({
  inicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  fim: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  ativo: z.boolean()
}).optional();

// Schema para disponibilidade por dia
const disponibilidadeDiaSchema = z.object({
  inicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  fim: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  ativo: z.boolean()
}).refine(data => {
  if (!data.ativo) return true // Se inativo, não validar horários
  
  const [inicioH, inicioM] = data.inicio.split(':').map(Number)
  const [fimH, fimM] = data.fim.split(':').map(Number)
  const inicioMinutos = inicioH * 60 + inicioM
  const fimMinutos = fimH * 60 + fimM
  
  return inicioMinutos < fimMinutos
}, {
  message: 'Horário de início deve ser anterior ao horário de fim'
})

// Schema para disponibilidade completa
const disponibilidadeSchema = z.object({
  seg: diaDisponibilidadeSchema,
  ter: diaDisponibilidadeSchema,
  qua: diaDisponibilidadeSchema,
  qui: diaDisponibilidadeSchema,
  sex: diaDisponibilidadeSchema,
  sab: diaDisponibilidadeSchema,
  dom: diaDisponibilidadeSchema
}).optional();

// Schema para bloqueio de datas
const bloqueioDataSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD'),
  motivo: z.string().min(1, 'Motivo é obrigatório')
});

// Schema para valores monetários (aceita string formatada ou número)
const monetarySchema = z.union([
  z.string().transform((val) => parseMoney(val)),
  z.number()
]).refine((val) => val > 0, 'Valor deve ser maior que zero');

// Schema para percentual
const percentualSchema = z.union([
  z.string().transform((val) => parseFloat(val.replace(',', '.')) || 0),
  z.number()
]).refine((val) => val >= 0 && val <= 100, 'Percentual deve estar entre 0 e 100');

// Schema base para parceiro
const parceiroBaseSchema = z.object({
  nomeCompleto: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  cpfCnpj: z.string()
    .min(11, 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos')
    .max(18, 'CPF/CNPJ inválido')
    .refine((val) => isValidCPFCNPJ(val), 'CPF ou CNPJ inválido'),
  
  telefoneContato: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(15, 'Telefone deve ter no máximo 15 dígitos'),
  
  email: z.string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  
  especialidades: z.array(z.string().min(1, 'Especialidade não pode estar vazia'))
    .min(1, 'Pelo menos uma especialidade é obrigatória'),
  
  // Serviços habilitados (opcional)
  servicosHabilitados: z.array(z.number().positive('ID do serviço deve ser positivo')).optional(),
  
  // Endereço (opcional)
  cep: z.string().optional(),
  rua: z.string().max(200, 'Rua deve ter no máximo 200 caracteres').optional(),
  numero: z.string().max(10, 'Número deve ter no máximo 10 caracteres').optional(),
  complemento: z.string().max(100, 'Complemento deve ter no máximo 100 caracteres').optional(),
  bairro: z.string().max(100, 'Bairro deve ter no máximo 100 caracteres').optional(),
  cidade: z.string().max(100, 'Cidade deve ter no máximo 100 caracteres').optional(),
  estado: z.string().max(2, 'Estado deve ter 2 caracteres').optional(),
  
  // Tipo de parceria
  tipoParceria: z.enum(['sublocacao', 'porcentagem', 'porcentagem_produto'], {
    errorMap: () => ({ message: 'Tipo de parceria inválido' })
  }),
  
  // Configurações financeiras (condicionais) - agora aceita string ou number
  valorSublocacao: monetarySchema.optional(),
  diaVencimentoSublocacao: z.union([
    z.string().transform((val) => parseInt(val) || 0),
    z.number()
  ]).refine((val) => val >= 1 && val <= 31, 'Dia deve estar entre 1 e 31').optional(),
  
  valorRepasseServico: monetarySchema.optional(),
  percentualClinica: percentualSchema.optional(),
  
  // Dados bancários (opcionais)
  banco: z.string().max(100, 'Banco deve ter no máximo 100 caracteres').optional(),
  agencia: z.string().max(20, 'Agência deve ter no máximo 20 caracteres').optional(),
  conta: z.string().max(30, 'Conta deve ter no máximo 30 caracteres').optional(),
  pix: z.string().max(100, 'PIX deve ter no máximo 100 caracteres').optional(),
  
  // Disponibilidade e bloqueios
  disponibilidade: disponibilidadeSchema,
  observacoes: z.string().max(500, 'Observações deve ter no máximo 500 caracteres').optional(),
  bloqueiosDatas: z.array(bloqueioDataSchema).optional(),
  
  // Status
  ativo: z.boolean().optional()
});

// Schema para criação com validações condicionais
export const createParceiroSchema = parceiroBaseSchema.refine((data) => {
  // Validações específicas por tipo de parceria
  if (data.tipoParceria === 'sublocacao') {
    if (!data.valorSublocacao || data.valorSublocacao <= 0) {
      return false;
    }
    if (!data.diaVencimentoSublocacao || data.diaVencimentoSublocacao < 1 || data.diaVencimentoSublocacao > 31) {
      return false;
    }
  }
  
  if (data.tipoParceria === 'porcentagem') {
    if (!data.valorRepasseServico || data.valorRepasseServico <= 0) {
      return false;
    }
  }
  
  if (data.tipoParceria === 'porcentagem_produto') {
    if (data.percentualClinica === undefined || data.percentualClinica < 0 || data.percentualClinica > 100) {
      return false;
    }
  }
  
  return true;
}, {
  message: 'Configurações financeiras obrigatórias para o tipo de parceria selecionado',
  path: ['tipoParceria']
});

// Schema para atualização (todos os campos opcionais)
export const updateParceiroSchema = parceiroBaseSchema.partial().refine((data) => {
  // Se o tipo de parceria foi informado, validar configurações
  if (data.tipoParceria) {
    if (data.tipoParceria === 'sublocacao') {
      if (!data.valorSublocacao || data.valorSublocacao <= 0) {
        return false;
      }
      if (!data.diaVencimentoSublocacao || data.diaVencimentoSublocacao < 1 || data.diaVencimentoSublocacao > 31) {
        return false;
      }
    }
    
    if (data.tipoParceria === 'porcentagem') {
      if (!data.valorRepasseServico || data.valorRepasseServico <= 0) {
        return false;
      }
    }
    
    if (data.tipoParceria === 'porcentagem_produto') {
      if (data.percentualClinica === undefined || data.percentualClinica < 0 || data.percentualClinica > 100) {
        return false;
      }
    }
  }
  
  return true;
}, {
  message: 'Configurações financeiras obrigatórias para o tipo de parceria selecionado',
  path: ['tipoParceria']
});

// Schema para disponibilidade completa
export const disponibilidadeParceiroSchema = z.object({
  parceiroId: z.number().min(1, 'Parceiro é obrigatório'),
  disponibilidade: z.object({
    seg: disponibilidadeDiaSchema,
    ter: disponibilidadeDiaSchema,
    qua: disponibilidadeDiaSchema,
    qui: disponibilidadeDiaSchema,
    sex: disponibilidadeDiaSchema,
    sab: disponibilidadeDiaSchema,
    dom: disponibilidadeDiaSchema
  })
})

// Tipos derivados dos schemas
export type CreateParceiroFormData = z.infer<typeof createParceiroSchema>;
export type UpdateParceiroFormData = z.infer<typeof updateParceiroSchema>; 