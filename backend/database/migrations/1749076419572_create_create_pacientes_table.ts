import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pacientes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Dados pessoais
      table.string('nome_completo').notNullable()
      table.string('cpf', 14).unique().notNullable()
      table.date('data_nascimento').notNullable()
      
      // Contatos
      table.string('telefone_fixo', 15).nullable()
      table.string('whatsapp', 15).nullable()
      table.string('email').nullable()
      
      // Endereço
      table.string('cep', 10).nullable()
      table.string('rua').nullable()
      table.string('numero', 10).nullable()
      table.string('complemento').nullable()
      table.string('bairro').nullable()
      table.string('cidade').nullable()
      table.string('estado', 2).nullable()
      
      // Informações adicionais
      table.text('como_conheceu_clinica').nullable()
      table.text('indicacoes').nullable()
      table.text('observacoes_gerais').nullable()
      
      // Status
      table.boolean('ativo').defaultTo(true)
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      // Índices para otimizar buscas
      table.index(['nome_completo'])
      table.index(['cpf'])
      table.index(['email'])
      table.index(['whatsapp'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}