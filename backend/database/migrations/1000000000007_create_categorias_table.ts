import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'categorias'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nome', 100).notNullable()
      table.enum('tipo', ['produto', 'servico']).notNullable()
      table.string('descricao', 255).nullable()
      table.boolean('ativo').defaultTo(true)
      table.boolean('sistema').defaultTo(false) // Categorias do sistema não podem ser excluídas
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      // Índices
      table.unique(['nome', 'tipo']) // Nome único por tipo
      table.index(['tipo'])
      table.index(['ativo'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
} 