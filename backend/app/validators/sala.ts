import vine from '@vinejs/vine'

/**
 * Validator para criação de sala
 */
export const createSalaValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(2).maxLength(100),
    descricao: vine.string().trim().optional(),
    recursos: vine.array(vine.string().trim()).optional(),
    ativa: vine.boolean().optional(),
  })
)

/**
 * Validator para atualização de sala
 */
export const updateSalaValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(2).maxLength(100).optional(),
    descricao: vine.string().trim().optional(),
    recursos: vine.array(vine.string().trim()).optional(),
    ativa: vine.boolean().optional(),
  })
) 