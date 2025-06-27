import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  /**
   * Login do usuário
   */
  async login({ request, response, auth }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    try {
      // Buscar usuário por email
      const user = await User.findBy('email', email)

      if (!user) {
        return response.status(400).json({
          message: 'Credenciais inválidas',
        })
      }

      // Verificar se o usuário está ativo
      if (!user.active) {
        return response.status(400).json({
          message: 'Usuário inativo',
        })
      }

      // Verificar senha
      const isPasswordValid = await hash.verify(user.password, password)

      if (!isPasswordValid) {
        return response.status(400).json({
          message: 'Credenciais inválidas',
        })
      }

      // Gerar token de acesso
      const token = await User.accessTokens.create(user)

      return response.status(200).json({
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: token.value?.release(),
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro interno do servidor',
        error: error.message,
      })
    }
  }

  /**
   * Logout do usuário
   */
  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const token = auth.user?.currentAccessToken

      if (token) {
        await User.accessTokens.delete(user, token.identifier)
      }

      return response.status(200).json({
        message: 'Logout realizado com sucesso',
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro interno do servidor',
        error: error.message,
      })
    }
  }

  /**
   * Verificar usuário autenticado
   */
  async me({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      return response.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    } catch (error) {
      return response.status(401).json({
        message: 'Não autenticado',
      })
    }
  }
}