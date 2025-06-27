import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'produtos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Dados básicos
      table.string('nome').notNullable()
      table.text('descricao').nullable()
      table.enum('tipo', ['produto', 'servico']).notNullable()
      table.string('categoria').notNullable()

      // Preços
      table.decimal('preco_venda', 10, 2).notNullable()
      table.decimal('preco_custo', 10, 2).nullable()
      table.decimal('preco_parceiro', 10, 2).nullable()

      // Duração (para serviços)
      table.integer('duracao_minutos').nullable()

      // Estoque (para produtos)
      table.integer('estoque_atual').nullable()
      table.integer('estoque_minimo').nullable()
      table.boolean('controla_estoque').defaultTo(false)

      // Relacionamentos
      table.integer('parceiro_id').unsigned().nullable().references('id').inTable('parceiros').onDelete('SET NULL')

      // Configurações
      table.boolean('disponivel_agendamento').defaultTo(true)
      table.boolean('requer_preparo').defaultTo(false)
      table.text('instrucoes_preparo').nullable()

      // Tags e classificação
      table.text('tags').nullable() // JSON string
      table.string('codigo_interno').nullable().unique()

      // Observações e status
      table.text('observacoes').nullable()
      table.boolean('ativo').defaultTo(true)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}