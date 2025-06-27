import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Paciente extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Dados pessoais
  @column()
  declare nomeCompleto: string

  @column()
  declare cpf: string

  @column.date()
  declare dataNascimento: DateTime

  // Contatos
  @column()
  declare telefoneFixo: string | null

  @column()
  declare whatsapp: string | null

  @column()
  declare email: string | null

  // Endereço
  @column()
  declare cep: string | null

  @column()
  declare rua: string | null

  @column()
  declare numero: string | null

  @column()
  declare complemento: string | null

  @column()
  declare bairro: string | null

  @column()
  declare cidade: string | null

  @column()
  declare estado: string | null

  // Informações adicionais
  @column()
  declare comoConheceuClinica: string | null

  @column()
  declare indicacoes: string | null

  @column()
  declare observacoesGerais: string | null

  // Status
  @column()
  declare ativo: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Método para buscar pacientes ativos
  static async findActive() {
    return await this.query().where('ativo', true).orderBy('nome_completo', 'asc')
  }

  // Método para buscar por CPF
  static async findByCpf(cpf: string) {
    return await this.findBy('cpf', cpf)
  }

  // Método para buscar pacientes com filtros
  static async search(termo: string) {
    return await this.query()
      .where('ativo', true)
      .where((query) => {
        query
          .whereILike('nome_completo', `%${termo}%`)
          .orWhereILike('cpf', `%${termo}%`)
          .orWhereILike('email', `%${termo}%`)
          .orWhereILike('whatsapp', `%${termo}%`)
      })
      .orderBy('nome_completo', 'asc')
  }
}