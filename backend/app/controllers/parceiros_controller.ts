import type { HttpContext } from '@adonisjs/core/http'
import Parceiro from '#models/parceiro'
import { createParceiroValidator, updateParceiroValidator } from '#validators/parceiro'

export default class ParceirosController {
  /**
   * Listar parceiros com paginação e filtros
   */
  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const search = request.input('search', '')
      const ativas = request.input('ativas')
      const tipoParceria = request.input('tipoParceria')
      const especialidade = request.input('especialidade')

      let query = Parceiro.query()

      // Filtro por ativas
      if (ativas !== undefined) {
        query = query.where('ativo', ativas === 'true')
      }

      // Filtro por tipo de parceria
      if (tipoParceria) {
        query = query.where('tipo_parceria', tipoParceria)
      }

      // Filtro por especialidade
      if (especialidade) {
        query = query.whereRaw('JSON_CONTAINS(especialidades, ?)', [`"${especialidade}"`])
      }

      // Busca por termo
      if (search) {
        query = query.where((subQuery) => {
          subQuery
            .whereILike('nome_completo', `%${search}%`)
            .orWhereILike('cpf_cnpj', `%${search}%`)
            .orWhereILike('email', `%${search}%`)
            .orWhereILike('telefone_contato', `%${search}%`)
        })
      }

      // Ordenação e paginação
      const parceiros = await query
        .orderBy('nome_completo', 'asc')
        .paginate(page, limit)

      // Serializar os dados com correção manual dos campos JSON
      const data = {
        data: parceiros.all().map(parceiro => {
          const serialized = parceiro.serialize()
          
          // Garantir que servicosHabilitados seja sempre array
          if (typeof parceiro.servicosHabilitados === 'string') {
            try {
              serialized.servicosHabilitados = JSON.parse(parceiro.servicosHabilitados)
            } catch {
              serialized.servicosHabilitados = []
            }
          }
          
          return serialized
        }),
        meta: parceiros.getMeta(),
      }

      return response.json({
        success: true,
        data,
      })
    } catch (error) {
      console.error('Erro ao listar parceiros:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
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
        data: parceiro.serialize(),
      })
    } catch (error) {
      console.error('Erro ao buscar parceiro:', error)
      return response.status(404).json({
        success: false,
        message: 'Parceiro não encontrado',
      })
    }
  }

  /**
   * Criar novo parceiro
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createParceiroValidator)

      // Verificar se CPF/CNPJ já existe
      const cpfCnpjExistente = await Parceiro.findByCpfCnpj(data.cpfCnpj)
      if (cpfCnpjExistente) {
        return response.status(400).json({
          success: false,
          message: 'CPF/CNPJ já cadastrado',
        })
      }

      // Verificar se email já existe
      const emailExistente = await Parceiro.findByEmail(data.email)
      if (emailExistente) {
        return response.status(400).json({
          success: false,
          message: 'Email já cadastrado',
        })
      }

      // Validações específicas por tipo de parceria
      const validationError = this.validateParceriaData(data)
      if (validationError) {
        return response.status(400).json({
          success: false,
          message: validationError,
        })
      }

      // Criar parceiro
      const parceiro = await Parceiro.create({
        nomeCompleto: data.nomeCompleto,
        cpfCnpj: data.cpfCnpj,
        telefoneContato: data.telefoneContato,
        email: data.email,
        especialidades: data.especialidades,
        servicosHabilitados: data.servicosHabilitados || [],
        cep: data.cep || null,
        rua: data.rua || null,
        numero: data.numero || null,
        complemento: data.complemento || null,
        bairro: data.bairro || null,
        cidade: data.cidade || null,
        estado: data.estado || null,
        tipoParceria: data.tipoParceria,
        valorSublocacao: data.valorSublocacao || null,
        diaVencimentoSublocacao: data.diaVencimentoSublocacao || null,
        valorRepasseServico: data.valorRepasseServico || null,
        percentualClinica: data.percentualClinica || null,
        banco: data.banco || null,
        agencia: data.agencia || null,
        conta: data.conta || null,
        pix: data.pix || null,
        disponibilidade: data.disponibilidade || null,
        observacoes: data.observacoes || null,
        bloqueiosDatas: data.bloqueiosDatas || null,
        ativo: data.ativo !== undefined ? data.ativo : true,
      })

      return response.status(201).json({
        success: true,
        data: parceiro.serialize(),
        message: 'Parceiro criado com sucesso',
      })
    } catch (error) {
      console.error('Erro ao criar parceiro:', error)
      
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
   * Atualizar parceiro
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const parceiro = await Parceiro.findOrFail(params.id)
      const data = await request.validateUsing(updateParceiroValidator)

      // Verificar se CPF/CNPJ já existe (exceto para o próprio parceiro)
      if (data.cpfCnpj && data.cpfCnpj !== parceiro.cpfCnpj) {
        const cpfCnpjExistente = await Parceiro.findByCpfCnpj(data.cpfCnpj)
        if (cpfCnpjExistente) {
          return response.status(400).json({
            success: false,
            message: 'CPF/CNPJ já cadastrado',
          })
        }
      }

      // Verificar se email já existe (exceto para o próprio parceiro)
      if (data.email && data.email !== parceiro.email) {
        const emailExistente = await Parceiro.findByEmail(data.email)
        if (emailExistente) {
          return response.status(400).json({
            success: false,
            message: 'Email já cadastrado',
          })
        }
      }

      // Validações específicas por tipo de parceria
      const dataWithCurrentType = { ...data, tipoParceria: data.tipoParceria || parceiro.tipoParceria }
      const validationError = this.validateParceriaData(dataWithCurrentType)
      if (validationError) {
        return response.status(400).json({
          success: false,
          message: validationError,
        })
      }

      // Atualizar campos
      if (data.nomeCompleto !== undefined) parceiro.nomeCompleto = data.nomeCompleto
      if (data.cpfCnpj !== undefined) parceiro.cpfCnpj = data.cpfCnpj
      if (data.telefoneContato !== undefined) parceiro.telefoneContato = data.telefoneContato
      if (data.email !== undefined) parceiro.email = data.email
      if (data.especialidades !== undefined) parceiro.especialidades = data.especialidades
      if (data.servicosHabilitados !== undefined) parceiro.servicosHabilitados = data.servicosHabilitados
      if (data.cep !== undefined) parceiro.cep = data.cep
      if (data.rua !== undefined) parceiro.rua = data.rua
      if (data.numero !== undefined) parceiro.numero = data.numero
      if (data.complemento !== undefined) parceiro.complemento = data.complemento
      if (data.bairro !== undefined) parceiro.bairro = data.bairro
      if (data.cidade !== undefined) parceiro.cidade = data.cidade
      if (data.estado !== undefined) parceiro.estado = data.estado
      if (data.tipoParceria !== undefined) parceiro.tipoParceria = data.tipoParceria
      if (data.valorSublocacao !== undefined) parceiro.valorSublocacao = data.valorSublocacao
      if (data.diaVencimentoSublocacao !== undefined) parceiro.diaVencimentoSublocacao = data.diaVencimentoSublocacao
      if (data.valorRepasseServico !== undefined) parceiro.valorRepasseServico = data.valorRepasseServico
      if (data.percentualClinica !== undefined) parceiro.percentualClinica = data.percentualClinica
      if (data.banco !== undefined) parceiro.banco = data.banco
      if (data.agencia !== undefined) parceiro.agencia = data.agencia
      if (data.conta !== undefined) parceiro.conta = data.conta
      if (data.pix !== undefined) parceiro.pix = data.pix
      if (data.disponibilidade !== undefined) parceiro.disponibilidade = data.disponibilidade
      if (data.observacoes !== undefined) parceiro.observacoes = data.observacoes
      if (data.bloqueiosDatas !== undefined) parceiro.bloqueiosDatas = data.bloqueiosDatas
      if (data.ativo !== undefined) parceiro.ativo = data.ativo

      await parceiro.save()

      return response.json({
        success: true,
        data: parceiro.serialize(),
        message: 'Parceiro atualizado com sucesso',
      })
    } catch (error) {
      console.error('Erro ao atualizar parceiro:', error)
      
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
   * Excluir parceiro (soft delete)
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const parceiro = await Parceiro.findOrFail(params.id)
      
      // Soft delete - marcar como inativo
      parceiro.ativo = false
      await parceiro.save()

      return response.json({
        success: true,
        message: 'Parceiro removido com sucesso',
      })
    } catch (error) {
      console.error('Erro ao excluir parceiro:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Buscar parceiros por termo
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

      const parceiros = await Parceiro.search(termo.trim())

      return response.json({
        success: true,
        data: parceiros.map(parceiro => parceiro.serialize()),
      })
    } catch (error) {
      console.error('Erro ao buscar parceiros:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Verificar se CPF/CNPJ é único
   */
  async checkCpfCnpj({ request, response }: HttpContext) {
    try {
      const { cpfCnpj, id } = request.only(['cpfCnpj', 'id'])
      
      if (!cpfCnpj) {
        return response.status(400).json({
          success: false,
          message: 'CPF/CNPJ é obrigatório',
        })
      }

      let query = Parceiro.query().where('cpf_cnpj', cpfCnpj)
      
      // Se tem ID, excluir da verificação (para atualização)
      if (id) {
        query = query.whereNot('id', id)
      }

      const parceiroExistente = await query.first()
      const disponivel = !parceiroExistente

      return response.json({
        success: true,
        disponivel,
        message: disponivel ? 'CPF/CNPJ disponível' : 'CPF/CNPJ já cadastrado',
      })
    } catch (error) {
      console.error('Erro ao verificar CPF/CNPJ:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Verificar se email é único
   */
  async checkEmail({ request, response }: HttpContext) {
    try {
      const { email, id } = request.only(['email', 'id'])
      
      if (!email) {
        return response.status(400).json({
          success: false,
          message: 'Email é obrigatório',
        })
      }

      let query = Parceiro.query().where('email', email)
      
      // Se tem ID, excluir da verificação (para atualização)
      if (id) {
        query = query.whereNot('id', id)
      }

      const parceiroExistente = await query.first()
      const disponivel = !parceiroExistente

      return response.json({
        success: true,
        disponivel,
        message: disponivel ? 'Email disponível' : 'Email já cadastrado',
      })
    } catch (error) {
      console.error('Erro ao verificar email:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Obter disponibilidade do parceiro
   */
  async obterDisponibilidade({ params, response }: HttpContext) {
    try {
      const parceiro = await Parceiro.findOrFail(params.id)

      return response.json({
        success: true,
        data: {
          parceiroId: parceiro.id,
          nome: parceiro.nomeCompleto,
          disponibilidade: parceiro.disponibilidade || this.obterDisponibilidadePadrao()
        },
        message: 'Disponibilidade obtida com sucesso',
      })
    } catch (error) {
      console.error('Erro ao obter disponibilidade:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
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
          if (!diaConfig.inicio || !diaConfig.fim) {
            return response.status(400).json({
              success: false,
              message: `Horários de início e fim são obrigatórios para ${dia} quando ativo`,
            })
          }

          // Validar formato de hora
          const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
          if (!horaRegex.test(diaConfig.inicio) || !horaRegex.test(diaConfig.fim)) {
            return response.status(400).json({
              success: false,
              message: `Formato de hora inválido para ${dia}. Use HH:MM`,
            })
          }

          // Validar se início é anterior ao fim
          const [inicioH, inicioM] = diaConfig.inicio.split(':').map(Number)
          const [fimH, fimM] = diaConfig.fim.split(':').map(Number)
          const inicioMinutos = inicioH * 60 + inicioM
          const fimMinutos = fimH * 60 + fimM

          if (inicioMinutos >= fimMinutos) {
            return response.status(400).json({
              success: false,
              message: `Horário de início deve ser anterior ao horário de fim para ${dia}`,
            })
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
      const diaConfig = disponibilidade[chavesDia]
      
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
        horarios: [{
          inicio: diaConfig.inicio,
          fim: diaConfig.fim
        }]
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
      seg: { inicio: '08:00', fim: '18:00', ativo: true },
      ter: { inicio: '08:00', fim: '18:00', ativo: true },
      qua: { inicio: '08:00', fim: '18:00', ativo: true },
      qui: { inicio: '08:00', fim: '18:00', ativo: true },
      sex: { inicio: '08:00', fim: '17:00', ativo: true },
      sab: { inicio: '08:00', fim: '12:00', ativo: false },
      dom: { inicio: '08:00', fim: '12:00', ativo: false }
    }
  }

  /**
   * Validar dados específicos por tipo de parceria
   */
  private validateParceriaData(data: any): string | null {
    switch (data.tipoParceria) {
      case 'sublocacao':
        if (!data.valorSublocacao || data.valorSublocacao <= 0) {
          return 'Valor da sublocação é obrigatório para tipo de parceria "Sublocação"'
        }
        if (!data.diaVencimentoSublocacao || data.diaVencimentoSublocacao < 1 || data.diaVencimentoSublocacao > 31) {
          return 'Dia de vencimento da sublocação é obrigatório (1-31) para tipo de parceria "Sublocação"'
        }
        break

      case 'porcentagem':
        if (!data.valorRepasseServico || data.valorRepasseServico <= 0) {
          return 'Valor do repasse por serviço é obrigatório para tipo de parceria "Porcentagem"'
        }
        break

      case 'porcentagem_produto':
        if (!data.percentualClinica || data.percentualClinica < 0 || data.percentualClinica > 100) {
          return 'Percentual da clínica é obrigatório (0-100%) para tipo de parceria "Porcentagem com Produto"'
        }
        break
    }

    return null
  }
}