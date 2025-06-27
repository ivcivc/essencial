import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Categoria extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare tipo: 'produto' | 'servico'

  @column()
  declare descricao: string | null

  @column()
  declare ativo: boolean

  @column()
  declare sistema: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * Buscar categorias por tipo
   */
  static async buscarPorTipo(tipo: 'produto' | 'servico') {
    return this.query()
      .where('tipo', tipo)
      .where('ativo', true)
      .orderBy('nome', 'asc')
  }

  /**
   * Verificar se nome é único para o tipo
   */
  static async nomeUnico(nome: string, tipo: 'produto' | 'servico', id?: number) {
    const query = this.query()
      .where('nome', nome)
      .where('tipo', tipo)
    
    if (id) {
      query.whereNot('id', id)
    }

    const categoria = await query.first()
    return !categoria
  }

  /**
   * Buscar por nome e tipo
   */
  static async buscarPorNomeTipo(nome: string, tipo: 'produto' | 'servico') {
    return this.query()
      .where('nome', nome)
      .where('tipo', tipo)
      .first()
  }
} 