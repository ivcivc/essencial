import { z } from 'zod'

export const categoriaSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .transform(val => val.trim()),
  tipo: z.enum(['produto', 'servico'], {
    required_error: 'Tipo é obrigatório',
    invalid_type_error: 'Tipo deve ser produto ou serviço'
  }),
  descricao: z.string()
    .max(255, 'Descrição deve ter no máximo 255 caracteres')
    .optional()
    .transform(val => val?.trim() || undefined),
  ativo: z.boolean().optional().default(true)
})

export const categoriaUpdateSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .transform(val => val.trim())
    .optional(),
  tipo: z.enum(['produto', 'servico'], {
    invalid_type_error: 'Tipo deve ser produto ou serviço'
  }).optional(),
  descricao: z.string()
    .max(255, 'Descrição deve ter no máximo 255 caracteres')
    .optional()
    .transform(val => val?.trim() || undefined),
  ativo: z.boolean().optional()
})

export const categoriaFilterSchema = z.object({
  search: z.string().optional(),
  tipo: z.enum(['produto', 'servico']).optional(),
  ativo: z.enum(['true', 'false', 'all']).optional().default('true'),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10)
})

export type CategoriaFormData = z.infer<typeof categoriaSchema>
export type CategoriaUpdateData = z.infer<typeof categoriaUpdateSchema>
export type CategoriaFilterData = z.infer<typeof categoriaFilterSchema> 