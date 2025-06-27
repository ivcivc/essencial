import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UsersController {
  /**
   * Listar todos os usuários
   */
  async index({ response }: HttpContext) {
    try {
      const users = await User.query()
        .select('id', 'name', 'email', 'role', 'active', 'created_at', 'updated_at')
        .orderBy('name', 'asc')

      return response.status(200).json({
        users,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao buscar usuários',
        error: error.message,
      })
    }
  }

  /**
   * Buscar usuário por ID
   */
  async show({ params, response }: HttpContext) {
    try {
      const user = await User.query()
        .select('id', 'name', 'email', 'role', 'active', 'created_at', 'updated_at')
        .where('id', params.id)
        .first()

      if (!user) {
        return response.status(404).json({
          message: 'Usuário não encontrado',
        })
      }

      return response.status(200).json({
        user,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao buscar usuário',
        error: error.message,
      })
    }
  }

  /**
   * Criar novo usuário
   */
  async store({ request, response }: HttpContext) {
    try {
      const { name, email, password, role } = request.only(['name', 'email', 'password', 'role'])

      // Verificar se o email já existe
      const existingUser = await User.findBy('email', email)
      if (existingUser) {
        return response.status(400).json({
          message: 'Este email já está em uso',
        })
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'recepcionista',
        active: true,
      })

      return response.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
        },
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao criar usuário',
        error: error.message,
      })
    }
  }

  /**
   * Atualizar usuário
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      const { name, email, password, role, active } = request.only([
        'name',
        'email',
        'password',
        'role',
        'active',
      ])

      // Verificar se o email já existe (exceto para o próprio usuário)
      if (email && email !== user.email) {
        const existingUser = await User.findBy('email', email)
        if (existingUser) {
          return response.status(400).json({
            message: 'Este email já está em uso',
          })
        }
      }

      // Atualizar campos
      if (name) user.name = name
      if (email) user.email = email
      if (password) user.password = password
      if (role) user.role = role
      if (active !== undefined) user.active = active

      await user.save()

      return response.status(200).json({
        message: 'Usuário atualizado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
        },
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          message: 'Usuário não encontrado',
        })
      }

      return response.status(500).json({
        message: 'Erro ao atualizar usuário',
        error: error.message,
      })
    }
  }

  /**
   * Excluir usuário
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      
      // Não permitir exclusão de administradores
      if (user.role === 'admin') {
        return response.status(400).json({
          message: 'Não é possível excluir usuários administradores',
        })
      }

      await user.delete()

      return response.status(200).json({
        message: 'Usuário excluído com sucesso',
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          message: 'Usuário não encontrado',
        })
      }

      return response.status(500).json({
        message: 'Erro ao excluir usuário',
        error: error.message,
      })
    }
  }
}