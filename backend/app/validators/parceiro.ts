import vine from '@vinejs/vine'

// Validator para criação de parceiro
export const createParceiroValidator = vine.compile(
  vine.object({
    nomeCompleto: vine.string().trim().minLength(2).maxLength(100),
    cpfCnpj: vine.string().trim().minLength(11).maxLength(18),
    telefoneContato: vine.string().trim().minLength(10).maxLength(15),
    email: vine.string().trim().email().normalizeEmail(),
    especialidades: vine.array(vine.string().trim().minLength(1)).minLength(1),
    
    // Serviços habilitados (opcional)
    servicosHabilitados: vine.array(vine.number().positive()).optional(),
    
    // Endereço (opcional)
    cep: vine.string().trim().optional(),
    rua: vine.string().trim().optional(),
    numero: vine.string().trim().optional(),
    complemento: vine.string().trim().optional(),
    bairro: vine.string().trim().optional(),
    cidade: vine.string().trim().optional(),
    estado: vine.string().trim().maxLength(2).optional(),
    
    // Tipo de parceria
    tipoParceria: vine.enum(['sublocacao', 'porcentagem', 'porcentagem_produto']),
    
    // Configurações financeiras (condicionais baseadas no tipo)
    valorSublocacao: vine.number().positive().optional(),
    diaVencimentoSublocacao: vine.number().min(1).max(31).optional(),
    valorRepasseServico: vine.number().positive().optional(),
    percentualClinica: vine.number().min(0).max(100).optional(),
    
    // Dados bancários (opcionais)
    banco: vine.string().trim().optional(),
    agencia: vine.string().trim().optional(),
    conta: vine.string().trim().optional(),
    pix: vine.string().trim().optional(),
    
    // Disponibilidade (opcional)
    disponibilidade: vine.object({
      seg: vine.object({
        inicio: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        fim: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ativo: vine.boolean()
      }).optional(),
      ter: vine.object({
        inicio: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        fim: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ativo: vine.boolean()
      }).optional(),
      qua: vine.object({
        inicio: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        fim: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ativo: vine.boolean()
      }).optional(),
      qui: vine.object({
        inicio: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        fim: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ativo: vine.boolean()
      }).optional(),
      sex: vine.object({
        inicio: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        fim: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ativo: vine.boolean()
      }).optional(),
      sab: vine.object({
        inicio: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        fim: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ativo: vine.boolean()
      }).optional(),
      dom: vine.object({
        inicio: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        fim: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ativo: vine.boolean()
      }).optional()
    }).optional(),
    
    // Observações e bloqueios
    observacoes: vine.string().trim().optional(),
    bloqueiosDatas: vine.array(
      vine.object({
        data: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
        motivo: vine.string().trim().minLength(1)
      })
    ).optional(),
    
    // Status
    ativo: vine.boolean().optional()
  })
)

// Validator para atualização de parceiro
export const updateParceiroValidator = vine.compile(
  vine.object({
    nomeCompleto: vine.string().trim().minLength(2).maxLength(100).optional(),
    cpfCnpj: vine.string().trim().minLength(11).maxLength(18).optional(),
    telefoneContato: vine.string().trim().minLength(10).maxLength(15).optional(),
    email: vine.string().trim().email().normalizeEmail().optional(),
    especialidades: vine.array(vine.string().trim().minLength(1)).minLength(1).optional(),
    
    // Serviços habilitados (opcional)
    servicosHabilitados: vine.array(vine.number().positive()).optional(),
    
    // Endereço (opcional)
    cep: vine.string().trim().optional(),
    rua: vine.string().trim().optional(),
    numero: vine.string().trim().optional(),
    complemento: vine.string().trim().optional(),
    bairro: vine.string().trim().optional(),
    cidade: vine.string().trim().optional(),
    estado: vine.string().trim().maxLength(2).optional(),
    
    // Tipo de parceria
    tipoParceria: vine.enum(['sublocacao', 'porcentagem', 'porcentagem_produto']).optional(),
    
    // Configurações financeiras (condicionais baseadas no tipo)
    valorSublocacao: vine.number().positive().optional(),
    diaVencimentoSublocacao: vine.number().min(1).max(31).optional(),
    valorRepasseServico: vine.number().positive().optional(),
    percentualClinica: vine.number().min(0).max(100).optional(),
    
    // Dados bancários (opcionais)
    banco: vine.string().trim().optional(),
    agencia: vine.string().trim().optional(),
    conta: vine.string().trim().optional(),
    pix: vine.string().trim().optional(),
    
    // Disponibilidade (opcional)
    disponibilidade: vine.object({
      seg: vine.object({
        inicio: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        fim: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ativo: vine.boolean()
      }).optional(),
      ter: vine.object({
        inicio: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        fim: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ativo: vine.boolean()
      }).optional(),
      qua: vine.object({
        inicio: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        fim: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ativo: vine.boolean()
      }).optional(),
      qui: vine.object({
        inicio: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        fim: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ativo: vine.boolean()
      }).optional(),
      sex: vine.object({
        inicio: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        fim: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ativo: vine.boolean()
      }).optional(),
      sab: vine.object({
        inicio: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        fim: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ativo: vine.boolean()
      }).optional(),
      dom: vine.object({
        inicio: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        fim: vine.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        ativo: vine.boolean()
      }).optional()
    }).optional(),
    
    // Observações e bloqueios
    observacoes: vine.string().trim().optional(),
    bloqueiosDatas: vine.array(
      vine.object({
        data: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
        motivo: vine.string().trim().minLength(1)
      })
    ).optional(),
    
    // Status
    ativo: vine.boolean().optional()
  })
) 