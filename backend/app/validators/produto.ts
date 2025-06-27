import vine from '@vinejs/vine'

/**
 * Validator para criação de produtos
 */
export const createProdutoValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(2).maxLength(255),
    descricao: vine.string().trim().maxLength(1000).optional(),
    tipo: vine.enum(['produto', 'servico']),
    categoria: vine.string().trim().minLength(2).maxLength(100),
    
    // Preços
    precoVenda: vine.number().min(0).decimal([0, 2]),
    precoCusto: vine.number().min(0).decimal([0, 2]).optional(),
    precoParceiro: vine.number().min(0).decimal([0, 2]).optional(),
    
    // Duração (para serviços)
    duracaoMinutos: vine.number().min(1).max(480).optional(), // Máximo 8 horas
    
    // Estoque (para produtos)
    estoqueAtual: vine.number().min(0).optional(),
    estoqueMinimo: vine.number().min(0).optional(),
    controlaEstoque: vine.boolean(),
    
    // Relacionamentos
    parceiroId: vine.number().positive().optional(),
    
    // Configurações
    disponivelAgendamento: vine.boolean(),
    requerPreparo: vine.boolean(),
    instrucoesPreparo: vine.string().trim().maxLength(1000).optional(),
    
    // Tags e classificação
    tags: vine.array(vine.string().trim().minLength(1).maxLength(50)).optional(),
    codigoInterno: vine.string().trim().minLength(1).maxLength(50).optional(),
    
    // Observações e status
    observacoes: vine.string().trim().maxLength(1000).optional(),
    ativo: vine.boolean().optional(),
    
    // Salas disponíveis (para serviços)
    salaIds: vine.array(vine.number().positive()).optional(),
  })
)

/**
 * Validator para atualização de produtos
 */
export const updateProdutoValidator = vine.compile(
  vine.object({
    nome: vine.string().trim().minLength(2).maxLength(255).optional(),
    descricao: vine.string().trim().maxLength(1000).optional(),
    tipo: vine.enum(['produto', 'servico']).optional(),
    categoria: vine.string().trim().minLength(2).maxLength(100).optional(),
    
    // Preços
    precoVenda: vine.number().min(0).decimal([0, 2]).optional(),
    precoCusto: vine.number().min(0).decimal([0, 2]).optional(),
    precoParceiro: vine.number().min(0).decimal([0, 2]).optional(),
    
    // Duração (para serviços)
    duracaoMinutos: vine.number().min(1).max(480).optional(), // Máximo 8 horas
    
    // Estoque (para produtos)
    estoqueAtual: vine.number().min(0).optional(),
    estoqueMinimo: vine.number().min(0).optional(),
    controlaEstoque: vine.boolean().optional(),
    
    // Relacionamentos
    parceiroId: vine.number().positive().optional(),
    
    // Configurações
    disponivelAgendamento: vine.boolean().optional(),
    requerPreparo: vine.boolean().optional(),
    instrucoesPreparo: vine.string().trim().maxLength(1000).optional(),
    
    // Tags e classificação
    tags: vine.array(vine.string().trim().minLength(1).maxLength(50)).optional(),
    codigoInterno: vine.string().trim().minLength(1).maxLength(50).optional(),
    
    // Observações e status
    observacoes: vine.string().trim().maxLength(1000).optional(),
    ativo: vine.boolean().optional(),
    
    // Salas disponíveis (para serviços)
    salaIds: vine.array(vine.number().positive()).optional(),
  })
)