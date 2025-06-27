import { DateTime } from 'luxon'
import { BaseModel, beforeSave, column, belongsTo, scope } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Paciente from './paciente.js'
import Parceiro from './parceiro.js'
import Produto from './produto.js'
import Sala from './sala.js'
import User from './user.js'

export default class Agendamento extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Relacionamentos
  @column()
  declare pacienteId: number

  @column()
  declare parceiroId: number

  @column()
  declare servicoId: number

  @column()
  declare salaId: number

  // Dados do agendamento
  @column.date()
  declare dataAgendamento: DateTime

  @column()
  declare horaInicio: string

  @column()
  declare horaFim: string

  @column()
  declare duracaoMinutos: number

  // Status
  @column()
  declare status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'nao_compareceu'

  // Valores
  @column()
  declare valorServico: number

  @column()
  declare valorProfissional: number | null

  @column()
  declare valorPago: boolean

  // Observações e controle
  @column()
  declare observacoes: string | null

  @column()
  declare observacoesInternas: string | null

  @column()
  declare primeiraConsulta: boolean

  @column()
  declare requerPreparo: boolean

  @column()
  declare instrucoesPreparo: string | null

  // Controle de chegada
  @column.dateTime()
  declare horaChegada: DateTime | null

  @column.dateTime()
  declare horaInicioReal: DateTime | null

  @column.dateTime()
  declare horaFimReal: DateTime | null

  // Reagendamento
  @column()
  declare agendamentoOriginalId: number | null

  @column()
  declare motivoCancelamento: string | null

  // Lembretes
  @column()
  declare lembreteEnviado: boolean

  @column.dateTime()
  declare dataLembrete: DateTime | null

  // Auditoria
  @column()
  declare createdBy: number | null

  @column()
  declare updatedBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime | null

  // Relacionamentos
  @belongsTo(() => Paciente)
  declare paciente: BelongsTo<typeof Paciente>

  @belongsTo(() => Parceiro, {
    foreignKey: 'parceiroId',
  })
  declare parceiro: BelongsTo<typeof Parceiro>

  @belongsTo(() => Produto, {
    foreignKey: 'servicoId',
  })
  declare servico: BelongsTo<typeof Produto>

  @belongsTo(() => Sala)
  declare sala: BelongsTo<typeof Sala>

  @belongsTo(() => User, {
    foreignKey: 'createdBy',
  })
  declare creator: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'updatedBy',
  })
  declare updater: BelongsTo<typeof User>

  @belongsTo(() => Agendamento, {
    foreignKey: 'agendamentoOriginalId',
  })
  declare agendamentoOriginal: BelongsTo<typeof Agendamento>

  // Scopes
  static activeOnly = scope((query) => {
    query.whereNull('deleted_at')
  })

  static byStatus = scope((query, status: string) => {
    query.where('status', status)
  })

  static byDate = scope((query, date: string) => {
    query.where('data_agendamento', date)
  })

  static byDateRange = scope((query, startDate: string, endDate: string) => {
    query.whereBetween('data_agendamento', [startDate, endDate])
  })

  static byParceiro = scope((query, parceiroId: number) => {
    query.where('parceiro_id', parceiroId)
  })

  static bySala = scope((query, salaId: number) => {
    query.where('sala_id', salaId)
  })

  static withRelations = scope((query) => {
    query
      .preload('paciente')
      .preload('parceiro')
      .preload('servico')
      .preload('sala')
  })

  // Hooks
  @beforeSave()
  static async calcularHoraFim(agendamento: Agendamento) {
    if (agendamento.horaInicio && agendamento.duracaoMinutos) {
      const [horas, minutos] = agendamento.horaInicio.split(':').map(Number)
      const inicioEmMinutos = horas * 60 + minutos
      const fimEmMinutos = inicioEmMinutos + agendamento.duracaoMinutos
      
      const horasFim = Math.floor(fimEmMinutos / 60)
      const minutosFim = fimEmMinutos % 60
      
      agendamento.horaFim = `${horasFim.toString().padStart(2, '0')}:${minutosFim.toString().padStart(2, '0')}`
    }
  }

  // Métodos auxiliares
  async verificarConflitos(): Promise<boolean> {
    const conflitos = await Agendamento.query()
      .withScopes((scopes) => scopes.activeOnly())
      .where('id', '!=', this.id)
      .where('data_agendamento', this.dataAgendamento.toSQLDate()!)
                    .where((query) => {
        query
          .where('parceiro_id', this.parceiroId)
          .orWhere('sala_id', this.salaId)
      })
      .where((query) => {
        query
          .whereBetween('hora_inicio', [this.horaInicio, this.horaFim])
          .orWhereBetween('hora_fim', [this.horaInicio, this.horaFim])
          .orWhere((subQuery) => {
            subQuery
              .where('hora_inicio', '<=', this.horaInicio)
              .where('hora_fim', '>=', this.horaFim)
          })
      })
      .whereNotIn('status', ['cancelado', 'nao_compareceu'])

    return conflitos.length > 0
  }

  async marcarChegada(): Promise<void> {
    this.horaChegada = DateTime.now()
    this.status = 'confirmado'
    await this.save()
  }

  async iniciarAtendimento(): Promise<void> {
    this.horaInicioReal = DateTime.now()
    this.status = 'em_andamento'
    await this.save()
  }

  async finalizarAtendimento(): Promise<void> {
    this.horaFimReal = DateTime.now()
    this.status = 'concluido'
    await this.save()
  }

  async cancelar(motivo?: string): Promise<void> {
    this.status = 'cancelado'
    this.motivoCancelamento = motivo || null
    await this.save()
  }

  async reagendar(novaData: DateTime, novoHorario: string): Promise<Agendamento> {
    // Cancelar agendamento atual
    await this.cancelar('Reagendado')
    
    // Criar novo agendamento
    const novoAgendamento = await Agendamento.create({
      pacienteId: this.pacienteId,
      parceiroId: this.parceiroId,
      servicoId: this.servicoId,
      salaId: this.salaId,
      dataAgendamento: novaData,
      horaInicio: novoHorario,
      duracaoMinutos: this.duracaoMinutos,
      valorServico: this.valorServico,
      valorProfissional: this.valorProfissional,
      observacoes: this.observacoes,
      observacoesInternas: this.observacoesInternas,
      primeiraConsulta: this.primeiraConsulta,
      requerPreparo: this.requerPreparo,
      instrucoesPreparo: this.instrucoesPreparo,
      agendamentoOriginalId: this.id,
      createdBy: this.updatedBy,
    })

    return novoAgendamento
  }

  // Métodos estáticos para consultas especiais
  static async buscarPorPeriodo(dataInicio: string, dataFim: string) {
    return await this.query()
      .withScopes((scopes) => scopes.activeOnly())
      .withScopes((scopes) => scopes.byDateRange(dataInicio, dataFim))
      .withScopes((scopes) => scopes.withRelations())
      .orderBy('data_agendamento', 'asc')
      .orderBy('hora_inicio', 'asc')
  }

  static async buscarDisponibilidade(
    parceiroId: number,
    data: string,
    horaInicio: string,
    duracaoMinutos: number
  ): Promise<boolean> {
    const [horas, minutos] = horaInicio.split(':').map(Number)
    const inicioEmMinutos = horas * 60 + minutos
    const fimEmMinutos = inicioEmMinutos + duracaoMinutos
    
    const horasFim = Math.floor(fimEmMinutos / 60)
    const minutosFim = fimEmMinutos % 60
    const horaFim = `${horasFim.toString().padStart(2, '0')}:${minutosFim.toString().padStart(2, '0')}`

    const conflitos = await this.query()
      .withScopes((scopes) => scopes.activeOnly())
      .where('data_agendamento', data)
      .where('parceiro_id', parceiroId)
      .where((query) => {
        query
          .whereBetween('hora_inicio', [horaInicio, horaFim])
          .orWhereBetween('hora_fim', [horaInicio, horaFim])
          .orWhere((subQuery) => {
            subQuery
              .where('hora_inicio', '<=', horaInicio)
              .where('hora_fim', '>=', horaFim)
          })
      })
      .whereNotIn('status', ['cancelado', 'nao_compareceu'])

    return conflitos.length === 0
  }

  static async buscarDisponibilidadeComExclusao(
    parceiroId: number,
    data: string,
    horaInicio: string,
    duracaoMinutos: number,
    agendamentoIdExcluir: number
  ): Promise<boolean> {
    console.log('🔍 buscarDisponibilidadeComExclusao chamado com:', {
      parceiroId,
      data,
      horaInicio,
      duracaoMinutos,
      agendamentoIdExcluir
    })

    const [horas, minutos] = horaInicio.split(':').map(Number)
    const inicioEmMinutos = horas * 60 + minutos
    const fimEmMinutos = inicioEmMinutos + duracaoMinutos
    
    const horasFim = Math.floor(fimEmMinutos / 60)
    const minutosFim = fimEmMinutos % 60
    const horaFim = `${horasFim.toString().padStart(2, '0')}:${minutosFim.toString().padStart(2, '0')}`

    console.log('⏰ Horários calculados:', { horaInicio, horaFim, duracaoMinutos })

    const conflitos = await this.query()
      .withScopes((scopes) => scopes.activeOnly())
      .where('data_agendamento', data)
      .where('parceiro_id', parceiroId)
      .where('id', '!=', agendamentoIdExcluir) // Excluir o próprio agendamento
      .where((query) => {
        // CORREÇÃO: Verificar sobreposição real (não adjacência)
        query
          // Caso 1: Novo agendamento começa durante outro agendamento
          .where((subQuery) => {
            subQuery
              .where('hora_inicio', '<', horaInicio)
              .where('hora_fim', '>', horaInicio)
          })
          // Caso 2: Novo agendamento termina durante outro agendamento
          .orWhere((subQuery) => {
            subQuery
              .where('hora_inicio', '<', horaFim)
              .where('hora_fim', '>', horaFim)
          })
          // Caso 3: Novo agendamento engloba outro agendamento completamente
          .orWhere((subQuery) => {
            subQuery
              .where('hora_inicio', '>=', horaInicio)
              .where('hora_fim', '<=', horaFim)
          })
          // Caso 4: Outro agendamento engloba o novo agendamento completamente
          .orWhere((subQuery) => {
            subQuery
              .where('hora_inicio', '<=', horaInicio)
              .where('hora_fim', '>=', horaFim)
          })
      })
      .whereNotIn('status', ['cancelado', 'nao_compareceu'])

    console.log('🔍 Conflitos encontrados:', conflitos.length)
    if (conflitos.length > 0) {
      console.log('⚠️ Detalhes dos conflitos:', conflitos.map(c => ({
        id: c.id,
        horaInicio: c.horaInicio,
        horaFim: c.horaFim,
        status: c.status,
        data: c.dataAgendamento,
        deletedAt: c.deletedAt,
        sobreposicao: `${c.horaInicio}-${c.horaFim} vs ${horaInicio}-${horaFim}`
      })))
      
      // CORREÇÃO AUTOMÁTICA: Se há conflito exato no mesmo horário, fazer soft delete do outro
      const conflitoExato = conflitos.find(c => 
        c.horaInicio === horaInicio && 
        c.horaFim === horaFim &&
        c.id !== agendamentoIdExcluir
      )
      
      if (conflitoExato) {
        console.log('🔧 CORREÇÃO: Removendo agendamento duplicado ID', conflitoExato.id)
        conflitoExato.deletedAt = DateTime.now()
        await conflitoExato.save()
        console.log('✅ Agendamento duplicado removido, permitindo edição')
        return true
      }
    }

    const disponivel = conflitos.length === 0
    console.log('✅ Resultado disponibilidade:', disponivel)

    return disponivel
  }

  static async obterEstatisticas(dataInicio: string, dataFim: string) {
    const agendamentos = await this.query()
      .withScopes((scopes) => scopes.activeOnly())
      .withScopes((scopes) => scopes.byDateRange(dataInicio, dataFim))

    const total = agendamentos.length
    const agendados = agendamentos.filter(a => a.status === 'agendado').length
    const confirmados = agendamentos.filter(a => a.status === 'confirmado').length
    const concluidos = agendamentos.filter(a => a.status === 'concluido').length
    const cancelados = agendamentos.filter(a => a.status === 'cancelado').length
    const naoCompareceu = agendamentos.filter(a => a.status === 'nao_compareceu').length

    const faturamento = agendamentos
      .filter(a => a.status === 'concluido' && a.valorPago)
      .reduce((sum, a) => sum + a.valorServico, 0)

    return {
      total,
      agendados,
      confirmados,
      concluidos,
      cancelados,
      naoCompareceu,
      faturamento,
      taxaConclusao: total > 0 ? (concluidos / total) * 100 : 0,
      taxaCancelamento: total > 0 ? ((cancelados + naoCompareceu) / total) * 100 : 0,
    }
  }

  // Serialização
  serialize() {
    return {
      id: this.id,
      pacienteId: this.pacienteId,
      parceiroId: this.parceiroId,
      servicoId: this.servicoId,
      salaId: this.salaId,
      dataAgendamento: this.dataAgendamento instanceof DateTime 
        ? this.dataAgendamento.toSQLDate() 
        : this.dataAgendamento, // Pode ser string ou null
      horaInicio: this.horaInicio,
      horaFim: this.horaFim,
      duracaoMinutos: this.duracaoMinutos,
      status: this.status,
      valorServico: this.valorServico,
      valorProfissional: this.valorProfissional,
      valorPago: this.valorPago,
      observacoes: this.observacoes,
      observacoesInternas: this.observacoesInternas,
      primeiraConsulta: this.primeiraConsulta,
      requerPreparo: this.requerPreparo,
      instrucoesPreparo: this.instrucoesPreparo,
      horaChegada: this.horaChegada?.toISO(),
      horaInicioReal: this.horaInicioReal?.toISO(),
      horaFimReal: this.horaFimReal?.toISO(),
      agendamentoOriginalId: this.agendamentoOriginalId,
      motivoCancelamento: this.motivoCancelamento,
      lembreteEnviado: this.lembreteEnviado,
      dataLembrete: this.dataLembrete?.toISO(),
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt?.toISO(),
      updatedAt: this.updatedAt?.toISO(),
      
      // Relacionamentos serializados quando carregados
      ...(this.paciente && { paciente: this.paciente.serialize() }),
      ...(this.parceiro && { parceiro: this.parceiro.serialize() }),
      ...(this.servico && { servico: this.servico.serialize() }),
      ...(this.sala && { sala: this.sala.serialize() }),
    }
  }
}