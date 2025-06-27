import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'configuracoes_sistema'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Identificador único da configuração
      table.string('chave', 100).notNullable().unique()
      
      // Valor da configuração (JSON para flexibilidade)
      table.json('valor').notNullable()
      
      // Descrição da configuração
      table.string('descricao', 255).nullable()
      
      // Categoria da configuração (ex: 'horarios', 'agendamentos', 'sistema')
      table.string('categoria', 50).notNullable().defaultTo('sistema')
      
      // Se a configuração é editável pelo usuário
      table.boolean('editavel').defaultTo(true)
      
      // Controle de versão
      table.integer('created_by').unsigned().nullable().references('id').inTable('users')
      table.integer('updated_by').unsigned().nullable().references('id').inTable('users')
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      // Índices
      table.index(['chave'])
      table.index(['categoria'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}