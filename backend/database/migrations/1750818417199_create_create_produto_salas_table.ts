import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'produto_salas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('produto_id').unsigned().notNullable().references('id').inTable('produtos').onDelete('CASCADE')
      table.integer('sala_id').unsigned().notNullable().references('id').inTable('salas').onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      // Garantir que a combinação produto_id + sala_id seja única
      table.unique(['produto_id', 'sala_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}