import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'salas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nome', 100).notNullable().unique()
      table.text('descricao').nullable()
      table.json('recursos').nullable() // Array de recursos da sala
      table.boolean('ativa').defaultTo(true)
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
} 