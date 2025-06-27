import type { HttpContext } from '@adonisjs/core/http'
import Categoria from '#models/categoria'
import { CategoriaValidator, CategoriaUpdateValidator } from '#validators/categoria'

export default class CategoriasController {
  /**
   * Listar categorias com filtros
   */
  async index({ request, response }: HttpContext) {
    try {
      const { page = 1, limit = 10, tipo, ativo = 'true', search } = request.qs()

      let query = Categoria.query()

      // Filtros
      if (tipo && ['produto', 'servico'].includes(tipo)) {
        query = query.where('tipo', tipo)
      }

      if (ativo === 'true') {
        query = query.where('ativo', true)
      } else if (ativo === 'false') {
        query = query.where('ativo', false)
      }

      if (search) {
        query = query.where((builder) => {
          builder
            .where('nome', 'like', `%${search}%`)
            .orWhere('descricao', 'like', `%${search}%`)
        })
      }

      const categorias = await query
        .orderBy('tipo', 'asc')
        .orderBy('nome', 'asc')
        .paginate(page, limit)

      return response.json({
        success: true,
        data: categorias.serialize(),
        message: 'Categorias listadas com sucesso'
      })
    } catch (error) {
      console.error('Erro ao listar categorias:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Buscar categoria por ID
   */
  async show({ params, response }: HttpContext) {
    try {
      const categoria = await Categoria.findOrFail(params.id)

      return response.json({
        success: true,
        data: categoria,
        message: 'Categoria encontrada'
      })
    } catch (error) {
      return response.status(404).json({
        success: false,
        message: 'Categoria não encontrada'
      })
    }
  }

  /**
   * Criar nova categoria
   */
  async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(CategoriaValidator)

      // Verificar se já existe categoria com mesmo nome e tipo
      const nomeDisponivel = await Categoria.nomeUnico(payload.nome, payload.tipo)
      if (!nomeDisponivel) {
        return response.status(422).json({
          success: false,
          message: `Já existe uma categoria "${payload.nome}" para ${payload.tipo === 'produto' ? 'produtos' : 'serviços'}`
        })
      }

      const categoria = await Categoria.create(payload)

      return response.status(201).json({
        success: true,
        data: categoria,
        message: 'Categoria criada com sucesso'
      })
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Atualizar categoria
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const categoria = await Categoria.findOrFail(params.id)
      
      // Verificar se é categoria do sistema
      if (categoria.sistema) {
        return response.status(422).json({
          success: false,
          message: 'Categorias do sistema não podem ser editadas'
        })
      }

      const payload = await request.validateUsing(CategoriaUpdateValidator)

      // Verificar se já existe categoria com mesmo nome e tipo (exceto a atual)
      if (payload.nome && payload.tipo) {
        const nomeDisponivel = await Categoria.nomeUnico(payload.nome, payload.tipo, categoria.id)
        if (!nomeDisponivel) {
          return response.status(422).json({
            success: false,
            message: `Já existe uma categoria "${payload.nome}" para ${payload.tipo === 'produto' ? 'produtos' : 'serviços'}`
          })
        }
      }

      categoria.merge(payload)
      await categoria.save()

      return response.json({
        success: true,
        data: categoria,
        message: 'Categoria atualizada com sucesso'
      })
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Excluir categoria
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const categoria = await Categoria.findOrFail(params.id)

      // Verificar se é categoria do sistema
      if (categoria.sistema) {
        return response.status(422).json({
          success: false,
          message: 'Categorias do sistema não podem ser excluídas'
        })
      }

      // Aqui você pode adicionar verificação se existem produtos/serviços usando esta categoria
      // const temProdutos = await Produto.query().where('categoria', categoria.nome).first()
      // if (temProdutos) {
      //   return response.status(422).json({
      //     success: false,
      //     message: 'Não é possível excluir categoria que está sendo usada por produtos/serviços'
      //   })
      // }

      await categoria.delete()

      return response.json({
        success: true,
        message: 'Categoria excluída com sucesso'
      })
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Buscar categorias por tipo
   */
  async buscarPorTipo({ params, response }: HttpContext) {
    try {
      const { tipo } = params
      
      if (!['produto', 'servico'].includes(tipo)) {
        return response.status(422).json({
          success: false,
          message: 'Tipo deve ser "produto" ou "servico"'
        })
      }

      const categorias = await Categoria.buscarPorTipo(tipo as 'produto' | 'servico')

      return response.json({
        success: true,
        data: categorias,
        message: `Categorias de ${tipo} listadas com sucesso`
      })
    } catch (error) {
      console.error('Erro ao buscar categorias por tipo:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Verificar se nome da categoria é único
   */
  async checkNome({ request, response }: HttpContext) {
    try {
      const { nome, tipo, id } = request.qs()

      if (!nome || !tipo) {
        return response.status(422).json({
          success: false,
          message: 'Nome e tipo são obrigatórios'
        })
      }

      const nomeDisponivel = await Categoria.nomeUnico(nome, tipo, id ? parseInt(id) : undefined)
      const existe = !nomeDisponivel

      return response.json({
        success: true,
        existe,
        message: existe ? 'Nome já existe' : 'Nome disponível'
      })
    } catch (error) {
      console.error('Erro ao verificar nome:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }
} 