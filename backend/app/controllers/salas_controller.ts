import type { HttpContext } from '@adonisjs/core/http'
import Sala from '#models/sala'
import { createSalaValidator, updateSalaValidator } from '#validators/sala'

export default class SalasController {
  /**
   * Listar todas as salas ativas
   */
  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const search = request.input('search', '')
      const ativas = request.input('ativas', 'true') // Filtro por salas ativas

      const query = Sala.query()

      // Filtro por salas ativas/inativas
      if (ativas === 'true') {
        query.where('ativa', true)
      } else if (ativas === 'false') {
        query.where('ativa', false)
      }

      // Busca por nome ou descrição
      if (search) {
        query.where((builder) => {
          builder
            .whereILike('nome', `%${search}%`)
            .orWhereILike('descricao', `%${search}%`)
        })
      }

      // Ordenação
      query.orderBy('nome', 'asc')

      const salas = await query.paginate(page, limit)

      return response.ok({
        success: true,
        data: salas.serialize(),
        meta: salas.getMeta(),
      })
    } catch (error) {
      console.error('Erro ao listar salas:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Buscar sala específica por ID
   */
  async show({ params, response }: HttpContext) {
    try {
      const sala = await Sala.findOrFail(params.id)

      return response.ok({
        success: true,
        data: sala.serialize(),
      })
    } catch (error) {
      return response.notFound({
        success: false,
        message: 'Sala não encontrada',
      })
    }
  }

  /**
   * Criar nova sala
   */
  async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(createSalaValidator)

      // Verificar se nome já existe
      const existingSala = await Sala.query().where('nome', payload.nome).first()
      if (existingSala) {
        return response.conflict({
          success: false,
          message: 'Já existe uma sala com este nome',
        })
      }

      const sala = await Sala.create({
        ...payload,
        recursos: payload.recursos || [],
      })

      return response.created({
        success: true,
        message: 'Sala criada com sucesso',
        data: sala.serialize(),
      })
    } catch (error) {
      console.error('Erro ao criar sala:', error)

      if (error.messages) {
        return response.badRequest({
          success: false,
          message: 'Dados inválidos',
          errors: error.messages,
        })
      }

      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Atualizar sala existente
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const sala = await Sala.findOrFail(params.id)
      const payload = await request.validateUsing(updateSalaValidator)

      // Verificar se nome já existe (exceto para a própria sala)
      if (payload.nome && payload.nome !== sala.nome) {
        const existingSala = await Sala.query()
          .where('nome', payload.nome)
          .where('id', '!=', sala.id)
          .first()

        if (existingSala) {
          return response.conflict({
            success: false,
            message: 'Já existe uma sala com este nome',
          })
        }
      }

      // Atualizar dados
      if (payload.nome !== undefined) sala.nome = payload.nome
      if (payload.descricao !== undefined) sala.descricao = payload.descricao
      if (payload.recursos !== undefined) sala.recursos = payload.recursos || []
      if (payload.ativa !== undefined) sala.ativa = payload.ativa

      await sala.save()

      return response.ok({
        success: true,
        message: 'Sala atualizada com sucesso',
        data: sala.serialize(),
      })
    } catch (error) {
      console.error('Erro ao atualizar sala:', error)

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({
          success: false,
          message: 'Sala não encontrada',
        })
      }

      if (error.messages) {
        return response.badRequest({
          success: false,
          message: 'Dados inválidos',
          errors: error.messages,
        })
      }

      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Excluir sala (soft delete - marca como inativa)
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const sala = await Sala.findOrFail(params.id)

      // Soft delete - marcar como inativa
      sala.ativa = false
      await sala.save()

      return response.ok({
        success: true,
        message: 'Sala removida com sucesso',
      })
    } catch (error) {
      console.error('Erro ao excluir sala:', error)

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({
          success: false,
          message: 'Sala não encontrada',
        })
      }

      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Buscar salas por termo
   */
  async search({ request, response }: HttpContext) {
    try {
      const { termo } = request.only(['termo'])

      if (!termo || termo.length < 2) {
        return response.badRequest({
          success: false,
          message: 'Termo de busca deve ter pelo menos 2 caracteres',
        })
      }

      const salas = await Sala.query()
        .where('ativa', true)
        .where((builder) => {
          builder
            .whereILike('nome', `%${termo}%`)
            .orWhereILike('descricao', `%${termo}%`)
        })
        .orderBy('nome', 'asc')
        .limit(20)

      return response.ok({
        success: true,
        data: salas.map((sala) => sala.serialize()),
      })
    } catch (error) {
      console.error('Erro na busca de salas:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Verificar se nome da sala é único
   */
  async checkNome({ request, response }: HttpContext) {
    try {
      const { nome, id } = request.only(['nome', 'id'])

      if (!nome) {
        return response.badRequest({
          success: false,
          message: 'Nome é obrigatório',
        })
      }

      const query = Sala.query().where('nome', nome)

      // Se for edição, excluir a própria sala da verificação
      if (id) {
        query.where('id', '!=', id)
      }

      const existingSala = await query.first()

      return response.ok({
        success: true,
        disponivel: !existingSala,
        message: existingSala ? 'Nome já está em uso' : 'Nome disponível',
      })
    } catch (error) {
      console.error('Erro na verificação de nome:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }
} 