import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Agendamento from '#models/agendamento'
import Paciente from '#models/paciente'
import Parceiro from '#models/parceiro'
import Produto from '#models/produto'
import Sala from '#models/sala'

export default class AgendamentosController {
  /**
   * Listar agendamentos com filtros
   */
  async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const search = request.input('search', '')
      const status = request.input('status', '')
      const parceiroId = request.input('parceiroId', '')
      const salaId = request.input('salaId', '')
      const dataInicio = request.input('dataInicio', '')
      const dataFim = request.input('dataFim', '')
      const pacienteId = request.input('pacienteId', '')

      const query = Agendamento.query()
        .withScopes((scopes) => scopes.activeOnly())
        .preload('paciente')
        .preload('parceiro')
        .preload('servico')
        .preload('sala')

      // Filtro por busca (nome do paciente ou parceiro)
      if (search) {
        query.where((searchQuery) => {
          searchQuery
            .whereHas('paciente', (pacienteQuery) => {
              pacienteQuery
                .whereILike('nome_completo', `%${search}%`)
                .orWhereILike('email', `%${search}%`)
                .orWhereILike('whatsapp', `%${search}%`)
            })
            .orWhereHas('parceiro', (parceiroQuery) => {
              parceiroQuery.whereILike('nome', `%${search}%`)
            })
            .orWhereHas('servico', (servicoQuery) => {
              servicoQuery.whereILike('nome', `%${search}%`)
            })
        })
      }

      // Filtro por status
      if (status) {
        query.where('status', status)
      }

      // Filtro por parceiro
      if (parceiroId) {
        query.where('parceiro_id', parceiroId)
      }

      // Filtro por sala
      if (salaId) {
        query.where('sala_id', salaId)
      }

      // Filtro por paciente
      if (pacienteId) {
        query.where('paciente_id', pacienteId)
      }

      // Filtro por período
      if (dataInicio && dataFim) {
        query.whereBetween('data_agendamento', [dataInicio, dataFim])
      } else if (dataInicio) {
        query.where('data_agendamento', '>=', dataInicio)
      } else if (dataFim) {
        query.where('data_agendamento', '<=', dataFim)
      }

      // Ordenação
      query.orderBy('data_agendamento', 'asc').orderBy('hora_inicio', 'asc')

      const agendamentos = await query.paginate(page, limit)

      return response.ok({
        success: true,
        data: agendamentos.serialize(),
      })
    } catch (error) {
      console.error('Erro ao listar agendamentos:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Buscar agendamento por ID
   */
  async show({ params, response }: HttpContext) {
    try {
      const agendamento = await Agendamento.query()
        .withScopes((scopes) => scopes.activeOnly())
        .where('id', params.id)
        .preload('paciente')
        .preload('parceiro')
        .preload('servico')
        .preload('sala')
        .firstOrFail()

      return response.ok({
        success: true,
        data: agendamento.serialize(),
      })
    } catch (error) {
      console.error('Erro ao buscar agendamento:', error)
      return response.notFound({
        success: false,
        message: 'Agendamento não encontrado',
      })
    }
  }

  /**
   * Criar novo agendamento
   */
  async store({ request, response, auth }: HttpContext) {
    try {
      const data = request.all()
      const user = auth.user!

      // Validar dados obrigatórios
      const validationError = this.validateAgendamentoData(data)
      if (validationError) {
        return response.badRequest({
          success: false,
          message: validationError,
        })
      }

      // Verificar se paciente existe
      const paciente = await Paciente.findOrFail(data.pacienteId)

      // Verificar se parceiro existe
      const parceiro = await Parceiro.findOrFail(data.parceiroId)

      // Verificar se serviço existe e está disponível para agendamento
      const servico = await Produto.query()
        .where('id', data.servicoId)
        .where('tipo', 'servico')
        .firstOrFail()

      // VALIDAÇÃO: Verificar se o serviço está disponível para agendamento
      if (!servico.disponivelAgendamento) {
        return response.badRequest({
          success: false,
          message: `O serviço "${servico.nome}" não está disponível para agendamento no momento.`,
        })
      }

      // Verificar se sala existe (se especificada)
      if (data.salaId) {
        await Sala.findOrFail(data.salaId)
      }

      // NOVA VALIDAÇÃO: Verificar se o horário está dentro da disponibilidade do parceiro
      const dataVerificacao = data.data || data.dataAgendamento || agendamento.dataAgendamento.toSQLDate()
      const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
      const dataObj = new Date(dataVerificacao + 'T00:00:00')
      const diaSemana = diasSemana[dataObj.getDay()]
      
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
      const disponibilidadeParceiro = parceiro.disponibilidade as any
      
      if (!disponibilidadeParceiro || !disponibilidadeParceiro[diaParceiroKey] || !disponibilidadeParceiro[diaParceiroKey].ativo) {
        return response.badRequest({
          success: false,
          message: `${parceiro.nomeCompleto} não atende às ${diaSemana}s`,
        })
      }
      
      // Verificar se o horário está dentro da disponibilidade do parceiro
      const diaParceiro = disponibilidadeParceiro[diaParceiroKey]
      const horaInicioVerificacao = data.horaInicio
      
      const [parceiroInicioH, parceiroInicioM] = diaParceiro.inicio.split(':').map(Number)
      const [parceiroFimH, parceiroFimM] = diaParceiro.fim.split(':').map(Number)
      const [agendInicioH, agendInicioM] = horaInicioVerificacao.split(':').map(Number)
      
      const parceiroInicioMin = parceiroInicioH * 60 + parceiroInicioM
      const parceiroFimMin = parceiroFimH * 60 + parceiroFimM
      const agendInicioMin = agendInicioH * 60 + agendInicioM
      
      if (agendInicioMin < parceiroInicioMin || agendInicioMin >= parceiroFimMin) {
        return response.badRequest({
          success: false,
          message: `Horário fora da disponibilidade do parceiro. ${parceiro.nomeCompleto} atende das ${diaParceiro.inicio} às ${diaParceiro.fim} às ${diaSemana}s`,
        })
      }

      // Verificar disponibilidade
      const disponivel = await Agendamento.buscarDisponibilidade(
        data.parceiroId,
        data.data || data.dataAgendamento,
        data.horaInicio,
        data.duracaoMinutos || servico.duracaoMinutos
      )

      if (!disponivel) {
        return response.conflict({
          success: false,
          message: 'Horário não está disponível',
        })
      }

      const agendamento = await Agendamento.create({
        pacienteId: data.pacienteId,
        parceiroId: data.parceiroId,
        servicoId: data.servicoId,
        salaId: data.salaId || null,
        dataAgendamento: data.data || data.dataAgendamento,
        horaInicio: data.horaInicio,
        duracaoMinutos: data.duracaoMinutos || servico.duracaoMinutos,
        valorServico: data.valorServico || servico.precoVenda,
        valorProfissional: data.valorParceiro || data.valorProfissional || servico.precoParceiro || 0,
        observacoes: data.observacoes || null,
        observacoesInternas: data.observacoesInternas || null,
        primeiraConsulta: data.primeiraConsulta || false,
        requerPreparo: data.requerPreparo || false,
        instrucoesPreparo: data.instrucoesPreparo || null,
        createdBy: user.id,
      })

      // Carregar relacionamentos
      await agendamento.load('paciente')
      await agendamento.load('parceiro')
      await agendamento.load('servico')
      if (agendamento.salaId) {
        await agendamento.load('sala')
      }

      return response.created({
        success: true,
        data: agendamento.serialize(),
        message: 'Agendamento criado com sucesso',
      })
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({
          success: false,
          message: 'Paciente, parceiro, serviço ou sala não encontrado',
        })
      }

      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Atualizar agendamento
   */
  async update({ params, request, response, auth }: HttpContext) {
    try {
      const data = request.all()
      const user = auth.user!

      console.log('🔍 === UPDATE AGENDAMENTO ===')
      console.log('ID:', params.id)
      console.log('Dados recebidos:', data)

      const agendamento = await Agendamento.query()
        .withScopes((scopes) => scopes.activeOnly())
        .where('id', params.id)
        .firstOrFail()

      console.log('📋 Agendamento original:', {
        id: agendamento.id,
        dataAgendamento: agendamento.dataAgendamento.toSQLDate(),
        horaInicio: agendamento.horaInicio,
        horaFim: agendamento.horaFim,
        parceiroId: agendamento.parceiroId,
        status: agendamento.status
      })

      // Não permitir atualizar agendamentos concluídos ou cancelados
      if (['concluido', 'cancelado'].includes(agendamento.status)) {
        return response.badRequest({
          success: false,
          message: 'Não é possível atualizar agendamentos concluídos ou cancelados',
        })
      }

      // Verificar se houve mudança significativa que requer validação de disponibilidade
      const dataVerificacao: string = data.data || data.dataAgendamento || agendamento.dataAgendamento.toSQLDate()
      const horaVerificacao: string = data.horaInicio || agendamento.horaInicio
      const parceiroVerificacao: number = data.parceiroId || agendamento.parceiroId
      const duracaoVerificacao: number = data.duracaoMinutos || agendamento.duracaoMinutos

      console.log('🔍 Verificando mudanças:', {
        dataOriginal: agendamento.dataAgendamento.toSQLDate(),
        dataNova: dataVerificacao,
        horaOriginal: agendamento.horaInicio,
        horaNova: horaVerificacao,
        parceiroOriginal: agendamento.parceiroId,
        parceiroNovo: parceiroVerificacao
      })

      // Se mudou horário, verificar disponibilidade
      if (
        dataVerificacao !== agendamento.dataAgendamento.toSQLDate() ||
        horaVerificacao !== agendamento.horaInicio ||
        duracaoVerificacao !== agendamento.duracaoMinutos ||
        parceiroVerificacao !== agendamento.parceiroId
      ) {
        console.log('🔄 Mudança detectada - verificando disponibilidade')
        
        // Verificar se o parceiro atende no dia da semana
        const parceiroId = parceiroVerificacao
        
        const { default: Parceiro } = await import('../models/parceiro.js')
        const parceiro = await Parceiro.find(parceiroId)
        
        if (!parceiro) {
          return response.badRequest({
            success: false,
            message: 'Parceiro não encontrado',
          })
        }
        
        // Verificar disponibilidade do parceiro no dia da semana
        const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
        const dataObj: Date = new Date(dataVerificacao + 'T00:00:00')
        const diaSemana: string = diasSemana[dataObj.getDay()]
        
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
        const disponibilidadeParceiro = parceiro.disponibilidade as any
        
        if (!disponibilidadeParceiro || !disponibilidadeParceiro[diaParceiroKey] || !disponibilidadeParceiro[diaParceiroKey].ativo) {
          return response.badRequest({
            success: false,
            message: `${parceiro.nomeCompleto} não atende às ${diaSemana}s`,
          })
        }
        
        // Verificar se o horário está dentro da disponibilidade do parceiro
        const diaParceiro = disponibilidadeParceiro[diaParceiroKey]
        const horaInicioVerificacao = horaVerificacao
        
        const [parceiroInicioH, parceiroInicioM] = diaParceiro.inicio.split(':').map(Number)
        const [parceiroFimH, parceiroFimM] = diaParceiro.fim.split(':').map(Number)
        const [agendInicioH, agendInicioM] = horaInicioVerificacao.split(':').map(Number)
        
        const parceiroInicioMin = parceiroInicioH * 60 + parceiroInicioM
        const parceiroFimMin = parceiroFimH * 60 + parceiroFimM
        const agendInicioMin = agendInicioH * 60 + agendInicioM
        
        if (agendInicioMin < parceiroInicioMin || agendInicioMin >= parceiroFimMin) {
          return response.badRequest({
            success: false,
            message: `Horário fora da disponibilidade do parceiro. ${parceiro.nomeCompleto} atende das ${diaParceiro.inicio} às ${diaParceiro.fim} às ${diaSemana}s`,
          })
        }

        console.log('🔍 Verificando conflitos de horário...')
        const disponivel = await Agendamento.buscarDisponibilidadeComExclusao(
          parceiroVerificacao,
          dataVerificacao,
          horaVerificacao,
          duracaoVerificacao,
          agendamento.id // Excluir o próprio agendamento da verificação
        )

        console.log('✅ Resultado verificação disponibilidade:', disponivel)

        if (!disponivel) {
          return response.conflict({
            success: false,
            message: 'Horário não está disponível para este parceiro',
          })
        }
      } else {
        console.log('ℹ️ Nenhuma mudança significativa detectada - pular verificação de disponibilidade')
      }

      // Preparar dados para atualização, removendo campos que não existem no modelo
      const updateData: any = { updatedBy: user.id }
      
      // Mapear campos do frontend para o modelo - APENAS se tiverem valores válidos
      if (data.horaInicio !== undefined && data.horaInicio !== '') {
        updateData.horaInicio = data.horaInicio
      }
      if (data.horaFim !== undefined && data.horaFim !== '') {
        updateData.horaFim = data.horaFim
      }
      if (data.salaId !== undefined && data.salaId !== '') {
        updateData.salaId = data.salaId
      }
      if (data.duracaoMinutos !== undefined) updateData.duracaoMinutos = data.duracaoMinutos
      if (data.status !== undefined) updateData.status = data.status
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes
      if (data.observacoesInternas !== undefined) updateData.observacoesInternas = data.observacoesInternas
      
      // Campos boolean - garantir conversão correta
      if (data.primeiraConsulta !== undefined) updateData.primeiraConsulta = Boolean(data.primeiraConsulta)
      if (data.requerPreparo !== undefined) updateData.requerPreparo = Boolean(data.requerPreparo)
      
      // Converter data string para dataAgendamento DateTime se fornecida
      if (data.data) {
        updateData.dataAgendamento = DateTime.fromISO(data.data)
        console.log('📅 Data convertida:', { original: data.data, convertida: updateData.dataAgendamento.toSQLDate() })
      } else if (data.dataAgendamento) {
        updateData.dataAgendamento = DateTime.fromISO(data.dataAgendamento)
        console.log('📅 DataAgendamento convertida:', { original: data.dataAgendamento, convertida: updateData.dataAgendamento.toSQLDate() })
      }

      // Validação final: garantir que campos obrigatórios não estão vazios
      if (updateData.horaInicio === '' || updateData.horaInicio === null) {
        return response.badRequest({
          success: false,
          message: 'Hora de início é obrigatória',
        })
      }

      console.log('🔍 Dados que serão atualizados:', updateData)

      agendamento.merge(updateData)

      await agendamento.save()

      console.log('✅ Agendamento salvo com sucesso')

      // Carregar relacionamentos
      await agendamento.load('paciente')
      await agendamento.load('parceiro')
      await agendamento.load('servico')
      await agendamento.load('sala')

      return response.ok({
        success: true,
        data: agendamento.serialize(),
        message: 'Agendamento atualizado com sucesso',
      })
    } catch (error) {
      console.error('❌ Erro ao atualizar agendamento:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
        details: error.message
      })
    }
  }

  /**
   * Excluir agendamento (soft delete)
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const agendamento = await Agendamento.query()
        .withScopes((scopes) => scopes.activeOnly())
        .where('id', params.id)
        .firstOrFail()

      agendamento.deletedAt = DateTime.now()
      await agendamento.save()

      return response.ok({
        success: true,
        message: 'Agendamento excluído com sucesso',
      })
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error)
      return response.notFound({
        success: false,
        message: 'Agendamento não encontrado',
      })
    }
  }

  /**
   * Buscar agendamentos para calendário
   */
  async calendario({ request, response }: HttpContext) {
    try {
      const dataInicio = request.input('dataInicio')
      const dataFim = request.input('dataFim')
      const profissionalId = request.input('profissionalId')

      if (!dataInicio || !dataFim) {
        return response.badRequest({
          success: false,
          message: 'Data de início e fim são obrigatórias',
        })
      }

      const query = Agendamento.query()
        .withScopes((scopes) => scopes.activeOnly())
        .withScopes((scopes) => scopes.byDateRange(dataInicio, dataFim))
        .preload('paciente')
        .preload('parceiro')
        .preload('servico')
        .preload('sala')

      if (profissionalId) {
        query.where('parceiro_id', profissionalId)
      }

      const agendamentos = await query

      // Formatar para fullcalendar
      const eventos = agendamentos.map((agendamento) => {
        const serialized = agendamento.serialize()
        return {
          id: agendamento.id,
          title: `${serialized.paciente?.nome || 'Paciente'} - ${serialized.servico?.nome || 'Serviço'}`,
          start: `${agendamento.dataAgendamento.toSQLDate()}T${agendamento.horaInicio}`,
          end: `${agendamento.dataAgendamento.toSQLDate()}T${agendamento.horaFim}`,
          backgroundColor: this.getStatusColor(agendamento.status),
          borderColor: this.getStatusColor(agendamento.status),
          extendedProps: serialized,
        }
      })

      return response.ok({
        success: true,
        data: eventos,
      })
    } catch (error) {
      console.error('Erro ao buscar eventos do calendário:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Verificar disponibilidade
   */
  async verificarDisponibilidade({ request, response }: HttpContext) {
    try {
      const { profissionalId, data, horaInicio, duracaoMinutos } = request.all()

      if (!profissionalId || !data || !horaInicio || !duracaoMinutos) {
        return response.badRequest({
          success: false,
          message: 'Todos os campos são obrigatórios',
        })
      }

      const disponivel = await Agendamento.buscarDisponibilidade(
        profissionalId,
        data,
        horaInicio,
        duracaoMinutos
      )

      return response.ok({
        success: true,
        data: { disponivel },
      })
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Marcar chegada do paciente
   */
  async marcarChegada({ params, response }: HttpContext) {
    try {
      const agendamento = await Agendamento.query()
        .withScopes((scopes) => scopes.activeOnly())
        .where('id', params.id)
        .firstOrFail()

      if (agendamento.status !== 'agendado') {
        return response.badRequest({
          success: false,
          message: 'Só é possível marcar chegada de agendamentos com status "agendado"',
        })
      }

      await agendamento.marcarChegada()

      return response.ok({
        success: true,
        data: agendamento.serialize(),
        message: 'Chegada marcada com sucesso',
      })
    } catch (error) {
      console.error('Erro ao marcar chegada:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Iniciar atendimento
   */
  async iniciarAtendimento({ params, response }: HttpContext) {
    try {
      const agendamento = await Agendamento.query()
        .withScopes((scopes) => scopes.activeOnly())
        .where('id', params.id)
        .firstOrFail()

      if (!['agendado', 'confirmado'].includes(agendamento.status)) {
        return response.badRequest({
          success: false,
          message: 'Só é possível iniciar atendimentos agendados ou confirmados',
        })
      }

      await agendamento.iniciarAtendimento()

      return response.ok({
        success: true,
        data: agendamento.serialize(),
        message: 'Atendimento iniciado com sucesso',
      })
    } catch (error) {
      console.error('Erro ao iniciar atendimento:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Finalizar atendimento
   */
  async finalizarAtendimento({ params, response }: HttpContext) {
    try {
      const agendamento = await Agendamento.query()
        .withScopes((scopes) => scopes.activeOnly())
        .where('id', params.id)
        .firstOrFail()

      if (agendamento.status !== 'em_andamento') {
        return response.badRequest({
          success: false,
          message: 'Só é possível finalizar atendimentos em andamento',
        })
      }

      await agendamento.finalizarAtendimento()

      return response.ok({
        success: true,
        data: agendamento.serialize(),
        message: 'Atendimento finalizado com sucesso',
      })
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Cancelar agendamento
   */
  async cancelar({ params, request, response }: HttpContext) {
    try {
      const { motivo } = request.all()

      const agendamento = await Agendamento.query()
        .withScopes((scopes) => scopes.activeOnly())
        .where('id', params.id)
        .firstOrFail()

      if (['concluido', 'cancelado'].includes(agendamento.status)) {
        return response.badRequest({
          success: false,
          message: 'Não é possível cancelar agendamentos concluídos ou já cancelados',
        })
      }

      await agendamento.cancelar(motivo)

      return response.ok({
        success: true,
        data: agendamento.serialize(),
        message: 'Agendamento cancelado com sucesso',
      })
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Obter estatísticas
   */
  async estatisticas({ request, response }: HttpContext) {
    try {
      const dataInicio = request.input('dataInicio')
      const dataFim = request.input('dataFim')

      if (!dataInicio || !dataFim) {
        return response.badRequest({
          success: false,
          message: 'Data de início e fim são obrigatórias',
        })
      }

      const stats = await Agendamento.obterEstatisticas(dataInicio, dataFim)

      return response.ok({
        success: true,
        data: stats,
      })
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error)
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
      })
    }
  }

  /**
   * Validar dados do agendamento
   */
  private validateAgendamentoData(data: any): string | null {
    if (!data.pacienteId) return 'ID do paciente é obrigatório'
    if (!data.parceiroId) return 'ID do parceiro é obrigatório'
    if (!data.servicoId) return 'ID do serviço é obrigatório'
    if (!data.salaId) return 'Sala é obrigatória'
    if (!data.data && !data.dataAgendamento) return 'Data do agendamento é obrigatória'
    if (!data.horaInicio) return 'Hora de início é obrigatória'

    return null
  }

  /**
   * Obter cor do status para o calendário
   */
  private getStatusColor(status: string): string {
    const colors = {
      agendado: '#3b82f6', // blue
      confirmado: '#10b981', // emerald
      em_andamento: '#f59e0b', // amber
      concluido: '#059669', // emerald-600
      cancelado: '#ef4444', // red
      nao_compareceu: '#6b7280', // gray
    }

    return colors[status as keyof typeof colors] || '#3b82f6'
  }
}