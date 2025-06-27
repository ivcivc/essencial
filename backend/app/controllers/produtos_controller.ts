import type { HttpContext } from '@adonisjs/core/http'
import Produto from '#models/produto'
import { createProdutoValidator, updateProdutoValidator } from '#validators/produto'

export default class ProdutosController {
  /**
   * Listar produtos com paginação e filtros
   */
  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const search = request.input('search', '')
      const ativo = request.input('ativo')
      const tipo = request.input('tipo')
      const categoria = request.input('categoria')
      const parceiroId = request.input('parceiroId')
      const disponivelAgendamento = request.input('disponivelAgendamento')
      const estoqueBaixo = request.input('estoqueBaixo')

      let query = Produto.query().preload('parceiro').preload('salas')

      // Filtro por ativo
      if (ativo !== undefined) {
        query = query.where('ativo', ativo === 'true')
      }

      // Filtro por tipo
      if (tipo) {
        query = query.where('tipo', tipo)
      }

      // Filtro por categoria
      if (categoria) {
        query = query.where('categoria', categoria)
      }

      // Filtro por parceiro
      if (parceiroId) {
        query = query.where('parceiro_id', parceiroId)
      }

      // Filtro por disponível para agendamento
      if (disponivelAgendamento !== undefined) {
        query = query.where('disponivel_agendamento', disponivelAgendamento === 'true')
      }

      // Filtro por estoque baixo
      if (estoqueBaixo === 'true') {
        query = query
          .where('controla_estoque', true)
          .whereRaw('estoque_atual <= estoque_minimo')
      }

      // Busca por termo
      if (search) {
        query = query.where((subQuery) => {
          subQuery
            .whereILike('nome', `%${search}%`)
            .orWhereILike('descricao', `%${search}%`)
            .orWhereILike('categoria', `%${search}%`)
            .orWhereILike('codigo_interno', `%${search}%`)
        })
      }

      // Ordenação e paginação
      const produtos = await query
        .orderBy('nome', 'asc')
        .paginate(page, limit)

      // Serializar os dados
      const data = {
        data: produtos.all().map(produto => produto.serialize()),
        meta: produtos.getMeta(),
      }

      return response.json({
        success: true,
        data,
      })
    } catch (error) {
      console.error('Erro ao listar produtos:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Buscar produto por ID
   */
  async show({ params, response }: HttpContext) {
    try {
      const produto = await Produto.query()
        .where('id', params.id)
        .preload('parceiro')
        .preload('salas')
        .firstOrFail()

      return response.json({
        success: true,
        data: produto.serialize(),
      })
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      return response.status(404).json({
        success: false,
        message: 'Produto não encontrado',
      })
    }
  }

  /**
   * Criar novo produto
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createProdutoValidator)

      // Verificar se código interno já existe (se fornecido)
      if (data.codigoInterno) {
        const codigoExistente = await Produto.findByCodigoInterno(data.codigoInterno)
        if (codigoExistente) {
          return response.status(400).json({
            success: false,
            message: 'Código interno já cadastrado',
          })
        }
      }

      // Validações específicas por tipo
      const validationError = this.validateProdutoData(data)
      if (validationError) {
        return response.status(400).json({
          success: false,
          message: validationError,
        })
      }

      // Criar produto
      const produto = await Produto.create({
        nome: data.nome,
        descricao: data.descricao || null,
        tipo: data.tipo,
        categoria: data.categoria,
        precoVenda: data.precoVenda,
        precoCusto: data.precoCusto || null,
        precoParceiro: data.precoParceiro || null,
        duracaoMinutos: data.duracaoMinutos || null,
        estoqueAtual: data.estoqueAtual || null,
        estoqueMinimo: data.estoqueMinimo || null,
        controlaEstoque: data.controlaEstoque,
        parceiroId: data.parceiroId || null,
        disponivelAgendamento: data.disponivelAgendamento,
        requerPreparo: data.requerPreparo,
        instrucoesPreparo: data.instrucoesPreparo || null,
        tags: data.tags || null,
        codigoInterno: data.codigoInterno || null,
        observacoes: data.observacoes || null,
        ativo: data.ativo !== undefined ? data.ativo : true,
      })

      // Associar salas se for serviço e se foram fornecidas
      if (data.salaIds && data.salaIds.length > 0 && data.tipo === 'servico') {
        await produto.related('salas').sync(data.salaIds)
      }

      // Recarregar com relacionamentos
      await produto.load('parceiro')
      await produto.load('salas')

      return response.status(201).json({
        success: true,
        data: produto.serialize(),
        message: 'Produto criado com sucesso',
      })
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.messages,
        })
      }

      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Atualizar produto
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const produto = await Produto.findOrFail(params.id)
      const data = await request.validateUsing(updateProdutoValidator)

      // Verificar se código interno já existe (exceto para o próprio produto)
      if (data.codigoInterno && data.codigoInterno !== produto.codigoInterno) {
        const codigoExistente = await Produto.findByCodigoInterno(data.codigoInterno)
        if (codigoExistente) {
          return response.status(400).json({
            success: false,
            message: 'Código interno já cadastrado',
          })
        }
      }

      // Validações específicas por tipo
      const validationError = this.validateProdutoData(data)
      if (validationError) {
        return response.status(400).json({
          success: false,
          message: validationError,
        })
      }

      // Debug: log dos dados recebidos
      console.log('=== DADOS RECEBIDOS NO BACKEND ===')
      console.log('data.ativo:', data.ativo, 'tipo:', typeof data.ativo)
      console.log('produto.ativo atual:', produto.ativo, 'tipo:', typeof produto.ativo)

      // Atualizar produto
      produto.merge({
        nome: data.nome || produto.nome,
        descricao: data.descricao !== undefined ? data.descricao : produto.descricao,
        tipo: data.tipo || produto.tipo,
        categoria: data.categoria || produto.categoria,
        precoVenda: data.precoVenda !== undefined ? data.precoVenda : produto.precoVenda,
        precoCusto: data.precoCusto !== undefined ? data.precoCusto : produto.precoCusto,
        precoParceiro: data.precoParceiro !== undefined ? data.precoParceiro : produto.precoParceiro,
        duracaoMinutos: data.duracaoMinutos !== undefined ? data.duracaoMinutos : produto.duracaoMinutos,
        estoqueAtual: data.estoqueAtual !== undefined ? data.estoqueAtual : produto.estoqueAtual,
        estoqueMinimo: data.estoqueMinimo !== undefined ? data.estoqueMinimo : produto.estoqueMinimo,
        controlaEstoque: data.controlaEstoque !== undefined ? data.controlaEstoque : produto.controlaEstoque,
        parceiroId: data.parceiroId !== undefined ? data.parceiroId : produto.parceiroId,
        disponivelAgendamento: data.disponivelAgendamento !== undefined ? data.disponivelAgendamento : produto.disponivelAgendamento,
        requerPreparo: data.requerPreparo !== undefined ? data.requerPreparo : produto.requerPreparo,
        instrucoesPreparo: data.instrucoesPreparo !== undefined ? data.instrucoesPreparo : produto.instrucoesPreparo,
        tags: data.tags !== undefined ? data.tags : produto.tags,
        codigoInterno: data.codigoInterno !== undefined ? data.codigoInterno : produto.codigoInterno,
        observacoes: data.observacoes !== undefined ? data.observacoes : produto.observacoes,
        ativo: data.ativo !== undefined ? data.ativo : produto.ativo,
      })

      console.log('=== APÓS MERGE ===')
      console.log('produto.ativo após merge:', produto.ativo, 'tipo:', typeof produto.ativo)

      await produto.save()

      console.log('=== APÓS SAVE ===')
      console.log('produto.ativo após save:', produto.ativo, 'tipo:', typeof produto.ativo)

      // Gerenciar associação com salas
      if (data.salaIds !== undefined) {
        if (produto.tipo === 'servico' && data.salaIds.length > 0) {
          await produto.related('salas').sync(data.salaIds)
        } else {
          // Se não é serviço ou não tem salas, limpar associações
          await produto.related('salas').detach()
        }
      }

      // Recarregar com relacionamentos
      await produto.load('parceiro')
      await produto.load('salas')

      return response.json({
        success: true,
        data: produto.serialize(),
        message: 'Produto atualizado com sucesso',
      })
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      
      if (error.code === 'E_VALIDATION_ERROR') {
        return response.status(422).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.messages,
        })
      }

      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Soft delete do produto
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const produto = await Produto.findOrFail(params.id)

      produto.ativo = false
      await produto.save()

      return response.json({
        success: true,
        message: 'Produto excluído com sucesso',
      })
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Buscar produtos por termo
   */
  async search({ request, response }: HttpContext) {
    try {
      const { termo } = request.only(['termo'])

      if (!termo || termo.trim().length < 2) {
        return response.status(400).json({
          success: false,
          message: 'Termo de busca deve ter pelo menos 2 caracteres',
        })
      }

      const produtos = await Produto.search(termo.trim())

      return response.json({
        success: true,
        data: produtos.map(produto => produto.serialize()),
      })
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Verificar se código interno já existe
   */
  async checkCodigoInterno({ request, response }: HttpContext) {
    try {
      const { codigoInterno, produtoId } = request.only(['codigoInterno', 'produtoId'])

      if (!codigoInterno) {
        return response.status(400).json({
          success: false,
          message: 'Código interno é obrigatório',
        })
      }

      const produto = await Produto.findByCodigoInterno(codigoInterno)
      
      // Se encontrou e não é o mesmo produto sendo editado
      const existe = produto && (!produtoId || produto.id !== Number(produtoId))

      return response.json({
        success: true,
        data: { existe },
      })
    } catch (error) {
      console.error('Erro ao verificar código interno:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Buscar produtos com estoque baixo
   */
  async estoqueBaixo({ response }: HttpContext) {
    try {
      const produtos = await Produto.findComEstoqueBaixo()

      return response.json({
        success: true,
        data: produtos.map(produto => produto.serialize()),
      })
    } catch (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Baixar estoque de um produto
   */
  async baixarEstoque({ params, request, response }: HttpContext) {
    try {
      const produto = await Produto.findOrFail(params.id)
      const { quantidade = 1 } = request.only(['quantidade'])

      const sucesso = await produto.baixarEstoque(quantidade)

      if (!sucesso) {
        return response.status(400).json({
          success: false,
          message: 'Estoque insuficiente',
        })
      }

      return response.json({
        success: true,
        data: produto.serialize(),
        message: 'Estoque baixado com sucesso',
      })
    } catch (error) {
      console.error('Erro ao baixar estoque:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Repor estoque de um produto
   */
  async reporEstoque({ params, request, response }: HttpContext) {
    try {
      const produto = await Produto.findOrFail(params.id)
      const { quantidade } = request.only(['quantidade'])

      if (!quantidade || quantidade <= 0) {
        return response.status(400).json({
          success: false,
          message: 'Quantidade deve ser maior que zero',
        })
      }

      await produto.reporEstoque(quantidade)

      return response.json({
        success: true,
        data: produto.serialize(),
        message: 'Estoque reposto com sucesso',
      })
    } catch (error) {
      console.error('Erro ao repor estoque:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Listar serviços ativos (para associação com parceiros)
   */
  async listarServicos({ response }: HttpContext) {
    try {
      const servicos = await Produto.query()
        .where('tipo', 'servico')
        .where('ativo', true)
        .orderBy('nome', 'asc')

      return response.json({
        success: true,
        data: servicos.map(servico => ({
          id: servico.id,
          nome: servico.nome,
          categoria: servico.categoria,
          precoVenda: Number(servico.precoVenda)
        })),
      })
    } catch (error) {
      console.error('Erro ao listar serviços:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Listar apenas serviços ativos para agendamento
   */
  async listarServicosParaAgendamento({ response }: HttpContext) {
    try {
      const servicos = await Produto.query()
        .where('tipo', 'servico')
        .where('ativo', true)
        .where('disponivel_agendamento', true)
        .preload('parceiro')
        .preload('salas')
        .orderBy('nome', 'asc')

      const data = servicos.map(servico => servico.serialize())

      return response.json({
        success: true,
        data,
      })
    } catch (error) {
      console.error('Erro ao listar serviços:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Buscar salas vinculadas a um serviço específico
   */
  async buscarSalasDoServico({ params, response }: HttpContext) {
    try {
      const servico = await Produto.query()
        .where('id', params.id)
        .where('tipo', 'servico')
        .preload('salas')
        .firstOrFail()

      const salas = servico.salas.map(sala => ({
        id: sala.id,
        nome: sala.nome,
        descricao: sala.descricao || null
      }))

      return response.json({
        success: true,
        data: salas,
      })
    } catch (error) {
      console.error('Erro ao buscar salas do serviço:', error)
      return response.status(404).json({
        success: false,
        message: 'Serviço não encontrado ou não possui salas vinculadas',
        data: []
      })
    }
  }

  /**
   * Validações específicas por tipo de produto
   */
  private validateProdutoData(data: any): string | null {
    // Para produtos, validar campos de estoque
    if (data.tipo === 'produto') {
      if (data.controlaEstoque) {
        if (data.estoqueAtual === undefined || data.estoqueAtual === null) {
          return 'Estoque atual é obrigatório para produtos que controlam estoque'
        }
        if (data.estoqueMinimo === undefined || data.estoqueMinimo === null) {
          return 'Estoque mínimo é obrigatório para produtos que controlam estoque'
        }
      }
    }

    // Para serviços, validar duração
    if (data.tipo === 'servico') {
      if (!data.duracaoMinutos) {
        return 'Duração em minutos é obrigatória para serviços'
      }
    }

    // Se tem parceiro, validar preço do parceiro
    if (data.parceiroId && !data.precoParceiro) {
      return 'Preço do parceiro é obrigatório quando um parceiro é selecionado'
    }

    return null
  }
}