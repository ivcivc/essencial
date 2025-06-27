import vine from '@vinejs/vine'

/**
 * Validator para criação de categoria
 */
export const CategoriaValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(2).maxLength(100),
    tipo: vine.enum(['produto', 'servico']),
    descricao: vine.string().trim().optional(),
    ativo: vine.boolean().optional()
  })
)

/**
 * Validator para atualização de categoria
 */
export const CategoriaUpdateValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(2).maxLength(100).optional(),
    tipo: vine.enum(['produto', 'servico']).optional(),
    descricao: vine.string().trim().optional(),
    ativo: vine.boolean().optional()
  })
) 