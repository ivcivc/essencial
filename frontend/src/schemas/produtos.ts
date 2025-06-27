import { z } from 'zod'
import { CATEGORIAS_PRODUTO, CATEGORIAS_SERVICO } from '../types/produtos'

// Schema base para produto/serviço
export const produtoSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
  
  descricao: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  
  tipo: z.enum(['produto', 'servico'], {
    required_error: 'Tipo é obrigatório',
    invalid_type_error: 'Tipo deve ser produto ou serviço'
  }),
  
  categoria: z
    .string()
    .min(2, 'Categoria deve ter pelo menos 2 caracteres')
    .max(100, 'Categoria deve ter no máximo 100 caracteres')
    .trim(),
  
  precoVenda: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'string') {
        const num = parseFloat(val.replace(/[^\d.,]/g, '').replace(',', '.'));
        return isNaN(num) ? 0 : num;
      }
      return val;
    })
    .refine((val) => val >= 0, 'Preço de venda deve ser maior ou igual a zero')
    .refine((val) => val <= 999999.99, 'Preço de venda muito alto'),
  
  precoCusto: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return undefined;
      if (typeof val === 'string') {
        const num = parseFloat(val.replace(/[^\d.,]/g, '').replace(',', '.'));
        return isNaN(num) ? undefined : num;
      }
      return val;
    })
    .refine((val) => val === undefined || val >= 0, 'Preço de custo deve ser maior ou igual a zero')
    .refine((val) => val === undefined || val <= 999999.99, 'Preço de custo muito alto')
    .optional(),
  
  precoParceiro: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return undefined;
      if (typeof val === 'string') {
        const num = parseFloat(val.replace(/[^\d.,]/g, '').replace(',', '.'));
        return isNaN(num) ? undefined : num;
      }
      return val;
    })
    .refine((val) => val === undefined || val >= 0, 'Preço do parceiro deve ser maior ou igual a zero')
    .refine((val) => val === undefined || val <= 999999.99, 'Preço do parceiro muito alto')
    .optional(),
  
  duracaoMinutos: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return undefined;
      if (typeof val === 'string') {
        const num = parseInt(val);
        return isNaN(num) ? undefined : num;
      }
      return val;
    })
    .refine((val) => val === undefined || val >= 1, 'Duração deve ser maior que zero')
    .refine((val) => val === undefined || val <= 480, 'Duração não pode exceder 8 horas (480 minutos)')
    .optional(),
  
  estoqueAtual: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return undefined;
      if (typeof val === 'string') {
        const num = parseInt(val);
        return isNaN(num) ? undefined : num;
      }
      return val;
    })
    .refine((val) => val === undefined || val >= 0, 'Estoque atual deve ser maior ou igual a zero')
    .optional(),
  
  estoqueMinimo: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return undefined;
      if (typeof val === 'string') {
        const num = parseInt(val);
        return isNaN(num) ? undefined : num;
      }
      return val;
    })
    .refine((val) => val === undefined || val >= 0, 'Estoque mínimo deve ser maior ou igual a zero')
    .optional(),
  
  controlaEstoque: z
    .union([z.boolean(), z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val === 'true';
      if (typeof val === 'number') return val === 1;
      return false;
    }),
  
  parceiroId: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === '') return undefined;
      if (typeof val === 'string') {
        const num = parseInt(val);
        return isNaN(num) ? undefined : num;
      }
      return val;
    })
    .refine((val) => val === undefined || val > 0, 'ID do parceiro deve ser um número positivo')
    .optional(),
  
  disponivelAgendamento: z
    .union([z.boolean(), z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val === 'true';
      if (typeof val === 'number') return val === 1;
      return false;
    }),
  
  requerPreparo: z
    .union([z.boolean(), z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') return val === 'true';
      if (typeof val === 'number') return val === 1;
      return false;
    }),
  
  instrucoesPreparo: z
    .string()
    .max(1000, 'Instruções de preparo devem ter no máximo 1000 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  
  tags: z
    .array(
      z.string()
        .min(1, 'Tag não pode estar vazia')
        .max(50, 'Tag deve ter no máximo 50 caracteres')
        .trim()
    )
    .optional(),
  
  codigoInterno: z
    .string()
    .min(1, 'Código interno não pode estar vazio')
    .max(50, 'Código interno deve ter no máximo 50 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  
  observacoes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  
  ativo: z
    .string({
      required_error: 'Status é obrigatório',
      invalid_type_error: 'Status deve ser uma string'
    })
    .min(1, 'Status é obrigatório')
    .refine((val) => val === 'true' || val === 'false', 'Status deve ser Ativo ou Inativo')
    .transform((val) => {
      console.log('Transform ativo - valor recebido:', val, 'tipo:', typeof val);
      const result = val === 'true';
      console.log('Transform ativo - resultado:', result);
      return result;
    }),
  
  salaIds: z
    .array(z.number().positive())
    .optional()
})

// Schema com validações condicionais
export const produtoFormSchema = produtoSchema.refine(
  (data) => {
    // Para produtos que controlam estoque, estoque atual e mínimo são obrigatórios
    if (data.tipo === 'produto' && data.controlaEstoque) {
      return data.estoqueAtual !== null && data.estoqueAtual !== undefined &&
             data.estoqueMinimo !== null && data.estoqueMinimo !== undefined
    }
    return true
  },
  {
    message: 'Estoque atual e mínimo são obrigatórios para produtos que controlam estoque',
    path: ['estoqueAtual']
  }
).refine(
  (data) => {
    // Para serviços, duração é obrigatória
    if (data.tipo === 'servico') {
      return data.duracaoMinutos !== null && data.duracaoMinutos !== undefined && data.duracaoMinutos > 0
    }
    return true
  },
  {
    message: 'Duração em minutos é obrigatória para serviços',
    path: ['duracaoMinutos']
  }
).refine(
  (data) => {
    // Se tem parceiro, preço do parceiro é obrigatório
    if (data.parceiroId) {
      return data.precoParceiro !== null && data.precoParceiro !== undefined && data.precoParceiro > 0
    }
    return true
  },
  {
    message: 'Preço do parceiro é obrigatório quando um parceiro é selecionado',
    path: ['precoParceiro']
  }
).refine(
  (data) => {
    // Validar categoria baseada no tipo - permitir categorias personalizadas
    if (data.tipo === 'produto') {
      return CATEGORIAS_PRODUTO.includes(data.categoria as any) || data.categoria === 'outros' || data.categoria.length >= 2
    } else if (data.tipo === 'servico') {
      return CATEGORIAS_SERVICO.includes(data.categoria as any) || data.categoria === 'outros' || data.categoria.length >= 2
    }
    return true
  },
  {
    message: 'Categoria deve ter pelo menos 2 caracteres',
    path: ['categoria']
  }
)

// Schema para filtros
export const produtosFiltrosSchema = z.object({
  search: z.string().optional(),
  tipo: z.enum(['produto', 'servico']).optional(),
  categoria: z.string().optional(),
  parceiroId: z.number().positive().optional(),
  ativo: z.boolean().optional(),
  disponivelAgendamento: z.boolean().optional(),
  estoqueBaixo: z.boolean().optional()
})

// Schema para busca por termo
export const produtoBuscaSchema = z.object({
  termo: z
    .string()
    .min(2, 'Termo de busca deve ter pelo menos 2 caracteres')
    .max(100, 'Termo de busca deve ter no máximo 100 caracteres')
    .trim()
})

// Schema para verificação de código interno
export const codigoInternoCheckSchema = z.object({
  codigoInterno: z
    .string()
    .min(1, 'Código interno não pode estar vazio')
    .max(50, 'Código interno deve ter no máximo 50 caracteres')
    .trim(),
  produtoId: z.number().positive().optional()
})

// Schema para controle de estoque
export const estoqueSchema = z.object({
  quantidade: z
    .number()
    .min(1, 'Quantidade deve ser maior que zero')
    .max(9999, 'Quantidade muito alta')
})

// Tipo inferido do schema
export type ProdutoFormData = z.infer<typeof produtoFormSchema>
export type ProdutosFiltros = z.infer<typeof produtosFiltrosSchema>
export type ProdutoBusca = z.infer<typeof produtoBuscaSchema>
export type CodigoInternoCheck = z.infer<typeof codigoInternoCheckSchema>
export type EstoqueData = z.infer<typeof estoqueSchema> 