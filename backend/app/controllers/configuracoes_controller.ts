import type { HttpContext } from '@adonisjs/core/http'
import ConfiguracaoSistema from '#models/configuracao_sistema'

export default class ConfiguracoesController {
  /**
   * Listar todas as configurações
   */
  async index({ response }: HttpContext) {
    try {
      const configuracoes = await ConfiguracaoSistema.query()
        .where('editavel', true)
        .orderBy('categoria')
        .orderBy('chave')

      return response.ok({
        success: true,
        data: configuracoes,
      })
    } catch (error) {
      console.error('Erro ao listar configurações:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Obter configuração específica
   */
  async show({ params, response }: HttpContext) {
    try {
      const configuracao = await ConfiguracaoSistema.query()
        .where('chave', params.chave)
        .first()

      if (!configuracao) {
        return response.notFound({
          success: false,
          message: 'Configuração não encontrada',
        })
      }

      return response.ok({
        success: true,
        data: configuracao,
      })
    } catch (error) {
      console.error('Erro ao buscar configuração:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Obter horários de funcionamento
   */
  async horariosFuncionamento({ response }: HttpContext) {
    try {
      const horarios = await ConfiguracaoSistema.obterHorariosFuncionamento()

      return response.ok({
        success: true,
        data: horarios,
      })
    } catch (error) {
      console.error('Erro ao buscar horários de funcionamento:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Atualizar horários de funcionamento
   */
  async atualizarHorariosFuncionamento({ request, response, auth }: HttpContext) {
    try {
      const data = request.all()
      const user = auth.user!

      // Validar estrutura dos dados
      const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
      
      for (const dia of diasSemana) {
        if (!data[dia] || typeof data[dia].ativo !== 'boolean') {
          return response.badRequest({
            success: false,
            message: `Configuração inválida para ${dia}`,
          })
        }

        if (data[dia].ativo && (!data[dia].periodos || !Array.isArray(data[dia].periodos))) {
          return response.badRequest({
            success: false,
            message: `Períodos obrigatórios para ${dia} quando ativo`,
          })
        }

        // Validar formato dos períodos
        if (data[dia].periodos) {
          for (const periodo of data[dia].periodos) {
            if (!periodo.inicio || !periodo.fim) {
              return response.badRequest({
                success: false,
                message: `Período inválido para ${dia}: início e fim são obrigatórios`,
              })
            }

            // Validar formato de hora (HH:MM)
            const regexHora = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
            if (!regexHora.test(periodo.inicio) || !regexHora.test(periodo.fim)) {
              return response.badRequest({
                success: false,
                message: `Formato de hora inválido para ${dia}. Use HH:MM`,
              })
            }

            // Validar se início é antes do fim
            const [inicioH, inicioM] = periodo.inicio.split(':').map(Number)
            const [fimH, fimM] = periodo.fim.split(':').map(Number)
            const inicioMinutos = inicioH * 60 + inicioM
            const fimMinutos = fimH * 60 + fimM

            if (inicioMinutos >= fimMinutos) {
              return response.badRequest({
                success: false,
                message: `Horário de início deve ser anterior ao fim para ${dia}`,
              })
            }
          }
        }
      }

      // Salvar configuração
      await ConfiguracaoSistema.definirConfiguracao('horarios_funcionamento', data, user.id)

      return response.ok({
        success: true,
        message: 'Horários de funcionamento atualizados com sucesso',
        data,
      })
    } catch (error) {
      console.error('Erro ao atualizar horários de funcionamento:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Obter configurações de agendamento
   */
  async configuracaoAgendamentos({ response }: HttpContext) {
    try {
      const configuracao = await ConfiguracaoSistema.obterConfiguracaoAgendamentos()

      return response.ok({
        success: true,
        data: configuracao,
      })
    } catch (error) {
      console.error('Erro ao buscar configuração de agendamentos:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Atualizar configurações de agendamento
   */
  async atualizarConfiguracaoAgendamentos({ request, response, auth }: HttpContext) {
    try {
      const data = request.all()
      const user = auth.user!

      // Validar dados
      if (data.intervaloSlots && (data.intervaloSlots < 15 || data.intervaloSlots > 120)) {
        return response.badRequest({
          success: false,
          message: 'Intervalo de slots deve estar entre 15 e 120 minutos',
        })
      }

      if (data.antecedenciaMinima && data.antecedenciaMinima < 0) {
        return response.badRequest({
          success: false,
          message: 'Antecedência mínima não pode ser negativa',
        })
      }

      if (data.antecedenciaMaxima && data.antecedenciaMaxima < 1) {
        return response.badRequest({
          success: false,
          message: 'Antecedência máxima deve ser pelo menos 1 dia',
        })
      }

      // Salvar configuração
      await ConfiguracaoSistema.definirConfiguracao('configuracao_agendamentos', data, user.id)

      return response.ok({
        success: true,
        message: 'Configurações de agendamento atualizadas com sucesso',
        data,
      })
    } catch (error) {
      console.error('Erro ao atualizar configuração de agendamentos:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Gerar horários disponíveis baseado na configuração da clínica e disponibilidade do parceiro
   */
  async gerarHorariosDisponiveis({ request, response }: HttpContext) {
    try {
      const { data, intervaloCustom, parceiroId } = request.all()

      if (!data) {
        return response.badRequest({
          success: false,
          message: 'Data é obrigatória',
        })
      }

      // Obter configurações da clínica
      const horariosFuncionamento = await ConfiguracaoSistema.obterHorariosFuncionamento()
      const configAgendamentos = await ConfiguracaoSistema.obterConfiguracaoAgendamentos()

      // Determinar dia da semana
      const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
      const dataObj = new Date(data + 'T00:00:00')
      const diaSemana = diasSemana[dataObj.getDay()]

      const configuracaoDiaClinica = horariosFuncionamento[diaSemana]

      if (!configuracaoDiaClinica || !configuracaoDiaClinica.ativo) {
        return response.ok({
          success: true,
          data: [],
          message: 'Clínica não funciona neste dia da semana',
        })
      }

      // Se parceiroId foi fornecido, verificar disponibilidade do parceiro
      let periodosDisponiveis = configuracaoDiaClinica.periodos
      let mensagemHorario = 'Horários baseados na configuração da clínica'
      
      if (parceiroId) {
        const { default: Parceiro } = await import('../models/parceiro.js')
        const parceiro = await Parceiro.find(parceiroId)
        
        if (!parceiro) {
          return response.badRequest({
            success: false,
            message: 'Parceiro não encontrado',
          })
        }

        // Mapear dias da semana para formato do parceiro
        const mapeamentoDias: Record<string, string> = {
          'domingo': 'dom',
          'segunda': 'seg', 
          'terca': 'ter',
          'quarta': 'qua',
          'quinta': 'qui',
          'sexta': 'sex',
          'sabado': 'sab'
        }

        const diaParceiroKey = mapeamentoDias[diaSemana]
        
        // Verificar se o parceiro atende neste dia
        if (!parceiro.disponibilidade || typeof parceiro.disponibilidade === 'string') {
          return response.ok({
            success: true,
            data: [],
            message: 'Parceiro não possui configuração de disponibilidade',
          })
        }

        const disponibilidadeParceiro = parceiro.disponibilidade as any
        const diaParceiro = disponibilidadeParceiro[diaParceiroKey]

        if (!diaParceiro || !diaParceiro.ativo) {
          return response.ok({
            success: true,
            data: [],
            message: 'Parceiro não atende neste dia da semana',
          })
        }

        // Cruzar horários da clínica com disponibilidade do parceiro
        const horarioParceiro = {
          inicio: diaParceiro.inicio,
          fim: diaParceiro.fim
        }

        // NOVA LÓGICA: Se o parceiro tem horários específicos, usar os horários do parceiro
        // em vez de fazer interseção com os horários da clínica
        // Isso permite que parceiros atendam fora do horário normal da clínica
        periodosDisponiveis = [{
          inicio: horarioParceiro.inicio,
          fim: horarioParceiro.fim
        }]

        // Adicionar mensagem informativa
        mensagemHorario = `Horários baseados na disponibilidade do parceiro (${horarioParceiro.inicio} às ${horarioParceiro.fim})`
      }

      // Gerar slots baseado nos períodos disponíveis
      const intervalo = intervaloCustom || configAgendamentos.intervaloSlots || 30
      const horarios: string[] = []

      for (const periodo of periodosDisponiveis) {
        const [inicioH, inicioM] = periodo.inicio.split(':').map(Number)
        const [fimH, fimM] = periodo.fim.split(':').map(Number)

        const inicioMinutos = inicioH * 60 + inicioM
        const fimMinutos = fimH * 60 + fimM

        // Gerar slots até o último possível (deixando espaço para o intervalo)
        for (let minutos = inicioMinutos; minutos <= fimMinutos - intervalo; minutos += intervalo) {
          const horas = Math.floor(minutos / 60)
          const mins = minutos % 60
          const horarioFormatado = `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
          horarios.push(horarioFormatado)
        }
      }

      return response.ok({
        success: true,
        data: horarios,
        message: mensagemHorario
      })
    } catch (error) {
      console.error('Erro ao gerar horários disponíveis:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }
}