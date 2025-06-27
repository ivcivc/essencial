import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'agendamentos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Relacionamentos
      table.integer('paciente_id').unsigned().references('id').inTable('pacientes').onDelete('CASCADE')
      table.integer('parceiro_id').unsigned().references('id').inTable('parceiros').onDelete('CASCADE')
      table.integer('servico_id').unsigned().references('id').inTable('produtos').onDelete('CASCADE')
      table.integer('sala_id').unsigned().nullable().references('id').inTable('salas').onDelete('SET NULL')
      
      // Dados do agendamento
      table.date('data_agendamento').notNullable()
      table.time('hora_inicio').notNullable()
      table.time('hora_fim').notNullable()
      table.integer('duracao_minutos').notNullable()
      
      // Status
      table.enum('status', [
        'agendado',
        'confirmado', 
        'em_andamento',
        'concluido',
        'cancelado',
        'nao_compareceu'
      ]).defaultTo('agendado')
      
      // Valores
      table.decimal('valor_servico', 10, 2).notNullable()
      table.decimal('valor_profissional', 10, 2).nullable()
      table.boolean('valor_pago').defaultTo(false)
      
      // Observações e controle
      table.text('observacoes').nullable()
      table.text('observacoes_internas').nullable()
      table.boolean('primeira_consulta').defaultTo(false)
      table.boolean('requer_preparo').defaultTo(false)
      table.text('instrucoes_preparo').nullable()
      
      // Controle de chegada
      table.datetime('hora_chegada').nullable()
      table.datetime('hora_inicio_real').nullable()
      table.datetime('hora_fim_real').nullable()
      
      // Reagendamento
      table.integer('agendamento_original_id').unsigned().nullable().references('id').inTable('agendamentos')
      table.text('motivo_cancelamento').nullable()
      
      // Lembretes
      table.boolean('lembrete_enviado').defaultTo(false)
      table.datetime('data_lembrete').nullable()
      
      // Auditoria
      table.integer('created_by').unsigned().nullable().references('id').inTable('users')
      table.integer('updated_by').unsigned().nullable().references('id').inTable('users')
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}