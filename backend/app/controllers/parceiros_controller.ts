import { HttpContext } from '@adonisjs/core/http'
import Parceiro from '../models/parceiro.js'
import type { Disponibilidade } from '../models/parceiro.js'

export default class ParceirosController {
  /**
   * Listar parceiros
   */
  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const search = request.input('search')
      const ativas = request.input('ativas')
      const tipoParceria = request.input('tipoParceria')
      const especialidade = request.input('especialidade')

      const query = Parceiro.query()

      // Filtros
      if (search) {
        query.where(query => {
          query
            .whereILike('nome_completo', `%${search}%`)
            .orWhereILike('email', `%${search}%`)
            .orWhereILike('telefone', `%${search}%`)
            .orWhereILike('cpf_cnpj', `%${search}%`)
        })
      }

      if (ativas !== undefined) {
        query.where('ativo', ativas === 'true')
      }

      if (tipoParceria) {
        query.where('tipo_parceria', tipoParceria)
      }

      if (especialidade) {
        query.whereJsonSuperset('especialidades', [especialidade])
      }

      // Ordenação e paginação
      const parceiros = await query
        .orderBy('nome_completo', 'asc')
        .paginate(page, limit)

      return response.json({
        success: true,
        data: parceiros
      })
    } catch (error) {
      console.error('Erro ao listar parceiros:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Buscar parceiro por ID
   */
  async show({ params, response }: HttpContext) {
    try {
      const parceiro = await Parceiro.findOrFail(params.id)
      
      return response.json({
        success: true,
        data: parceiro
      })
    } catch (error) {
      console.error('Erro ao buscar parceiro:', error)
      return response.status(404).json({
        success: false,
        message: 'Parceiro não encontrado'
      })
    }
  }

  /**
   * Criar novo parceiro
   */
  async store({ request, response }: HttpContext) {
    try {
      // Obter dados do request
      const data = request.only([
        'nomeCompleto',
        'email',
        'telefone',
        'cpfCnpj',
        'tipoParceria',
        'valorParceria',
        'especialidades',
        'servicos',
        'observacoes',
        'ativo'
      ])
      
      // Verificar se CPF/CNPJ já existe
      if (data.cpfCnpj) {
        const existingByCpfCnpj = await Parceiro.query()
          .where('cpf_cnpj', data.cpfCnpj)
          .first()
        
        if (existingByCpfCnpj) {
          return response.status(400).json({
            success: false,
            message: 'CPF/CNPJ já cadastrado'
          })
        }
      }
      
      // Verificar se email já existe
      if (data.email) {
        const existingByEmail = await Parceiro.query()
          .where('email', data.email)
          .first()
        
        if (existingByEmail) {
          return response.status(400).json({
            success: false,
            message: 'Email já cadastrado'
          })
        }
      }

      // Validar dados específicos do tipo de parceria
      const validationError = this.validateParceriaData(data)
      if (validationError) {
        return response.status(400).json({
          success: false,
          message: validationError
        })
      }

      // Criar parceiro
      const parceiro = await Parceiro.create({
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        telefoneContato: data.telefone,
        cpfCnpj: data.cpfCnpj,
        tipoParceria: data.tipoParceria,
        especialidades: data.especialidades || [],
        observacoes: data.observacoes,
        ativo: data.ativo !== undefined ? data.ativo : true,
        disponibilidade: this.obterDisponibilidadePadrao()
      })

      return response.status(201).json({
        success: true,
        data: parceiro,
        message: 'Parceiro criado com sucesso'
      })
    } catch (error) {
      console.error('Erro ao criar parceiro:', error)
      
      if (error.messages) {
        return response.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.messages
        })
      }
      
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Atualizar parceiro
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const parceiro = await Parceiro.findOrFail(params.id)
      
      // Obter dados do request
      const data = request.only([
        'nomeCompleto',
        'email',
        'telefone',
        'cpfCnpj',
        'tipoParceria',
        'valorParceria',
        'especialidades',
        'servicos',
        'observacoes',
        'ativo'
      ])
      
      // Verificar se CPF/CNPJ já existe
      if (data.cpfCnpj && data.cpfCnpj !== parceiro.cpfCnpj) {
        const existingByCpfCnpj = await Parceiro.query()
          .where('cpf_cnpj', data.cpfCnpj)
          .whereNot('id', parceiro.id)
          .first()
        
        if (existingByCpfCnpj) {
          return response.status(400).json({
            success: false,
            message: 'CPF/CNPJ já cadastrado'
          })
        }
      }
      
      // Verificar se email já existe
      if (data.email && data.email !== parceiro.email) {
        const existingByEmail = await Parceiro.query()
          .where('email', data.email)
          .whereNot('id', parceiro.id)
          .first()
        
        if (existingByEmail) {
          return response.status(400).json({
            success: false,
            message: 'Email já cadastrado'
          })
        }
      }

      // Validar dados específicos do tipo de parceria
      const validationError = this.validateParceriaData(data)
      if (validationError) {
        return response.status(400).json({
          success: false,
          message: validationError
        })
      }

      // Atualizar parceiro
      parceiro.merge({
        nomeCompleto: data.nomeCompleto !== undefined ? data.nomeCompleto : parceiro.nomeCompleto,
        email: data.email !== undefined ? data.email : parceiro.email,
        telefoneContato: data.telefone !== undefined ? data.telefone : parceiro.telefoneContato,
        cpfCnpj: data.cpfCnpj !== undefined ? data.cpfCnpj : parceiro.cpfCnpj,
        tipoParceria: data.tipoParceria !== undefined ? data.tipoParceria : parceiro.tipoParceria,
        especialidades: data.especialidades !== undefined ? data.especialidades : parceiro.especialidades,
        observacoes: data.observacoes !== undefined ? data.observacoes : parceiro.observacoes,
        ativo: data.ativo !== undefined ? data.ativo : parceiro.ativo
      })

      await parceiro.save()

      return response.json({
        success: true,
        data: parceiro,
        message: 'Parceiro atualizado com sucesso'
      })
    } catch (error) {
      console.error('Erro ao atualizar parceiro:', error)
      
      if (error.messages) {
        return response.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: error.messages
        })
      }
      
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Excluir parceiro
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const parceiro = await Parceiro.findOrFail(params.id)
      await parceiro.delete()

      return response.json({
        success: true,
        message: 'Parceiro excluído com sucesso'
      })
    } catch (error) {
      console.error('Erro ao excluir parceiro:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Buscar parceiros por termo
   */
  async search({ request, response }: HttpContext) {
    try {
      const termo = request.input('q', '')
      
      if (!termo || termo.length < 2) {
        return response.json({
          success: true,
          data: []
        })
      }
      
      const parceiros = await Parceiro.query()
        .where('nome_completo', 'LIKE', `%${termo}%`)
        .orWhere('email', 'LIKE', `%${termo}%`)
        .orWhere('cpf_cnpj', 'LIKE', `%${termo}%`)
        .where('ativo', true)
        .limit(10)
        .select(['id', 'nome_completo', 'email', 'cpf_cnpj', 'tipo_parceria'])
      
      return response.json({
        success: true,
        data: parceiros
      })
    } catch (error) {
      console.error('Erro na busca de parceiros:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Verificar se CPF/CNPJ já existe
   */
  async checkCpfCnpj({ request, response }: HttpContext) {
    try {
      const cpfCnpj = request.input('cpfCnpj')
      const id = request.input('id')
      
      if (!cpfCnpj) {
        return response.status(400).json({
          success: false,
          message: 'CPF/CNPJ é obrigatório'
        })
      }
      
      const query = Parceiro.query().where('cpf_cnpj', cpfCnpj)
      
      if (id) {
        query.whereNot('id', id)
      }
      
      const existingParceiro = await query.first()
      
      return response.json({
        success: true,
        exists: !!existingParceiro,
        message: existingParceiro ? 'CPF/CNPJ já cadastrado' : 'CPF/CNPJ disponível'
      })
    } catch (error) {
      console.error('Erro ao verificar CPF/CNPJ:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Verificar se email já existe
   */
  async checkEmail({ request, response }: HttpContext) {
    try {
      const email = request.input('email')
      const id = request.input('id')
      
      if (!email) {
        return response.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        })
      }
      
      const query = Parceiro.query().where('email', email)
      
      if (id) {
        query.whereNot('id', id)
      }
      
      const existingParceiro = await query.first()
      
      return response.json({
        success: true,
        exists: !!existingParceiro,
        message: existingParceiro ? 'Email já cadastrado' : 'Email disponível'
      })
    } catch (error) {
      console.error('Erro ao verificar email:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Obter disponibilidade do parceiro
   */
  async obterDisponibilidade({ params, response }: HttpContext) {
    try {
      const parceiro = await Parceiro.findOrFail(params.id)
      
      // Se não tiver disponibilidade configurada, retornar padrão
      const disponibilidade = parceiro.disponibilidade || this.obterDisponibilidadePadrao()
      
      return response.json({
        success: true,
        data: {
          parceiroId: parceiro.id,
          nome: parceiro.nomeCompleto,
          disponibilidade
        }
      })
    } catch (error) {
      console.error('Erro ao obter disponibilidade:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      })
    }
  }

  /**
   * Atualizar disponibilidade do parceiro
   */
  async atualizarDisponibilidade({ params, request, response }: HttpContext) {
    try {
      const parceiro = await Parceiro.findOrFail(params.id)
      const { disponibilidade } = request.only(['disponibilidade'])

      if (!disponibilidade) {
        return response.status(400).json({
          success: false,
          message: 'Dados de disponibilidade são obrigatórios',
        })
      }

      // Validar estrutura da disponibilidade
      const diasSemana = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
      for (const dia of diasSemana) {
        if (!disponibilidade[dia]) {
          return response.status(400).json({
            success: false,
            message: `Configuração para ${dia} é obrigatória`,
          })
        }

        const diaConfig = disponibilidade[dia]
        if (typeof diaConfig.ativo !== 'boolean') {
          return response.status(400).json({
            success: false,
            message: `Campo 'ativo' para ${dia} deve ser boolean`,
          })
        }

        if (diaConfig.ativo) {
          if (!Array.isArray(diaConfig.periodos) || diaConfig.periodos.length === 0) {
            return response.status(400).json({
              success: false,
              message: `Dia ${dia} está ativo mas não possui períodos configurados`,
            })
          }

          // Validar cada período
          for (const periodo of diaConfig.periodos) {
            if (!periodo.inicio || !periodo.fim) {
              return response.status(400).json({
                success: false,
                message: `Períodos para ${dia} devem ter início e fim`,
              })
            }

            // Validar formato de hora
            const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
            if (!horaRegex.test(periodo.inicio) || !horaRegex.test(periodo.fim)) {
              return response.status(400).json({
                success: false,
                message: `Formato de hora inválido para ${dia}. Use HH:MM`,
              })
            }

            // Validar que início é antes do fim
            const [inicioH, inicioM] = periodo.inicio.split(':').map(Number)
            const [fimH, fimM] = periodo.fim.split(':').map(Number)
            const inicioMinutos = inicioH * 60 + inicioM
            const fimMinutos = fimH * 60 + fimM

            if (inicioMinutos >= fimMinutos) {
              return response.status(400).json({
                success: false,
                message: `Horário de início deve ser anterior ao horário de fim para ${dia}`,
              })
            }
          }

          // Verificar sobreposição de períodos
          for (let i = 0; i < diaConfig.periodos.length; i++) {
            for (let j = i + 1; j < diaConfig.periodos.length; j++) {
              const p1 = diaConfig.periodos[i]
              const p2 = diaConfig.periodos[j]
              
              const [inicioH1, inicioM1] = p1.inicio.split(':').map(Number)
              const [fimH1, fimM1] = p1.fim.split(':').map(Number)
              const [inicioH2, inicioM2] = p2.inicio.split(':').map(Number)
              const [fimH2, fimM2] = p2.fim.split(':').map(Number)
              
              const inicio1 = inicioH1 * 60 + inicioM1
              const fim1 = fimH1 * 60 + fimM1
              const inicio2 = inicioH2 * 60 + inicioM2
              const fim2 = fimH2 * 60 + fimM2
              
              if ((inicio1 < fim2 && inicio2 < fim1)) {
                return response.status(400).json({
                  success: false,
                  message: `Períodos sobrepostos detectados para ${dia}`,
                })
              }
            }
          }
        }
      }

      // Atualizar disponibilidade
      parceiro.disponibilidade = disponibilidade
      await parceiro.save()

      return response.json({
        success: true,
        data: {
          parceiroId: parceiro.id,
          nome: parceiro.nomeCompleto,
          disponibilidade: parceiro.disponibilidade
        },
        message: 'Disponibilidade atualizada com sucesso',
      })
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Buscar disponibilidade do parceiro para uma data específica
   */
  async buscarDisponibilidade({ params, request, response }: HttpContext) {
    try {
      const parceiroId = params.id
      const data = request.input('data')

      if (!data) {
        return response.status(400).json({
          success: false,
          message: 'Data é obrigatória',
        })
      }

      const parceiro = await Parceiro.findOrFail(parceiroId)
      
      // Obter dia da semana (0 = domingo, 1 = segunda, etc.)
      const dataObj = new Date(data + 'T00:00:00')
      const diaSemana = dataObj.getDay()
      
      // Mapear dia da semana para chave da disponibilidade
      const diasMap = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
      const chavesDia = diasMap[diaSemana]
      
      const disponibilidade = parceiro.disponibilidade || this.obterDisponibilidadePadrao()
      const diaConfig = disponibilidade ? (disponibilidade as Disponibilidade)[chavesDia as keyof Disponibilidade] : null
      
      if (!diaConfig || !diaConfig.ativo) {
        return response.json({
          success: true,
          data: {
            disponivel: false,
            horarios: [],
            agendamentos: [],
            mensagem: 'Parceiro não atende neste dia da semana'
          }
        })
      }

      // Gerar horários baseados na configuração
      const horarios = [{
        diaSemana: diaSemana,
        horarios: diaConfig.periodos || []
      }]

      return response.json({
        success: true,
        data: {
          disponivel: true,
          horarios: horarios,
          agendamentos: [], // TODO: Implementar busca de agendamentos existentes
          mensagem: 'Disponibilidade obtida com sucesso'
        }
      })
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Obter disponibilidade padrão
   */
  private obterDisponibilidadePadrao() {
    return {
      seg: { 
        ativo: true, 
        periodos: [
          { inicio: '08:00', fim: '12:00' },
          { inicio: '14:00', fim: '18:00' }
        ] 
      },
      ter: { 
        ativo: true, 
        periodos: [
          { inicio: '08:00', fim: '12:00' },
          { inicio: '14:00', fim: '18:00' }
        ] 
      },
      qua: { 
        ativo: true, 
        periodos: [
          { inicio: '08:00', fim: '12:00' },
          { inicio: '14:00', fim: '18:00' }
        ] 
      },
      qui: { 
        ativo: true, 
        periodos: [
          { inicio: '08:00', fim: '12:00' },
          { inicio: '14:00', fim: '18:00' }
        ] 
      },
      sex: { 
        ativo: true, 
        periodos: [
          { inicio: '08:00', fim: '12:00' },
          { inicio: '13:00', fim: '17:00' }
        ] 
      },
      sab: { 
        ativo: false, 
        periodos: [] 
      },
      dom: { 
        ativo: false, 
        periodos: [] 
      }
    }
  }

  /**
   * Validar dados específicos do tipo de parceria
   */
  private validateParceriaData(data: any): string | null {
    // Validar valor da parceria para tipos específicos
    if (data.tipoParceria === 'porcentagem' || data.tipoParceria === 'porcentagem_produto') {
      if (data.valorParceria === undefined || data.valorParceria === null) {
        return 'Valor da parceria é obrigatório para este tipo de parceria'
      }
      
      if (data.valorParceria < 0 || data.valorParceria > 100) {
        return 'Valor da parceria deve estar entre 0 e 100%'
      }
    }
    
    return null
  }
}