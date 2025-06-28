import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class ConfiguracaoSistema extends BaseModel {
  public static table = 'configuracoes_sistema'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare chave: string

  @column({
    prepare: (value: any) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value)
  })
  declare valor: any

  @column()
  declare descricao: string | null

  @column()
  declare categoria: string

  @column()
  declare editavel: boolean

  @column()
  declare createdBy: number | null

  @column()
  declare updatedBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relacionamentos
  @belongsTo(() => User, {
    foreignKey: 'createdBy'
  })
  declare criador: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'updatedBy'
  })
  declare atualizador: BelongsTo<typeof User>

  // Métodos estáticos para facilitar o uso
  static async obterConfiguracao(chave: string, valorPadrao: any = null) {
    const config = await this.query().where('chave', chave).first()
    return config ? config.valor : valorPadrao
  }

  static async definirConfiguracao(chave: string, valor: any, userId?: number) {
    const config = await this.query().where('chave', chave).first()
    
    if (config) {
      config.valor = valor
      config.updatedBy = userId || null
      await config.save()
      return config
    } else {
      return await this.create({
        chave,
        valor,
        createdBy: userId || null,
        editavel: true,
        categoria: 'sistema'
      })
    }
  }

  static async obterHorariosFuncionamento() {
    return await this.obterConfiguracao('horarios_funcionamento', {
      segunda: { ativo: true, periodos: [{ inicio: '08:00', fim: '12:00' }, { inicio: '13:00', fim: '18:00' }] },
      terca: { ativo: true, periodos: [{ inicio: '08:00', fim: '12:00' }, { inicio: '13:00', fim: '18:00' }] },
      quarta: { ativo: true, periodos: [{ inicio: '08:00', fim: '12:00' }, { inicio: '13:00', fim: '18:00' }] },
      quinta: { ativo: true, periodos: [{ inicio: '08:00', fim: '12:00' }, { inicio: '13:00', fim: '18:00' }] },
      sexta: { ativo: true, periodos: [{ inicio: '08:00', fim: '12:00' }, { inicio: '13:00', fim: '18:00' }] },
      sabado: { ativo: false, periodos: [] },
      domingo: { ativo: false, periodos: [] }
    })
  }

  static async obterConfiguracaoAgendamentos() {
    return await this.obterConfiguracao('configuracao_agendamentos', {
      intervaloSlots: 30, // minutos
      antecedenciaMinima: 60, // minutos
      antecedenciaMaxima: 90, // dias
      permitirAgendamentoPassado: false,
      toleranciaEdicaoPassado: 60, // minutos
      permitirMoverConcluido: false,
      permitirMoverCancelado: false
    })
  }
}