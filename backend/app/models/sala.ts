import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave, afterFind } from '@adonisjs/lucid/orm'

export default class Sala extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare descricao: string | null

  @column()
  declare recursos: string[] | null

  @column()
  declare ativa: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  public static async serializeRecursos(sala: Sala) {
    if (sala.recursos && Array.isArray(sala.recursos)) {
      // @ts-ignore - Forçar conversão para JSON string antes de salvar
      sala.recursos = JSON.stringify(sala.recursos)
    }
  }

  @afterFind()
  public static async deserializeRecursos(sala: Sala) {
    if (sala.recursos && typeof sala.recursos === 'string') {
      try {
        sala.recursos = JSON.parse(sala.recursos)
      } catch {
        sala.recursos = []
      }
    }
  }

  // Serializar recursos como array
  public serialize() {
    const serialized = super.serialize()
    
    // Garantir que recursos seja sempre um array
    if (typeof serialized.recursos === 'string') {
      try {
        serialized.recursos = JSON.parse(serialized.recursos)
      } catch {
        serialized.recursos = []
      }
    }
    
    return serialized
  }
} 