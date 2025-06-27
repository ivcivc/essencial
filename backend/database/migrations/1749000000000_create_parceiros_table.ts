import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'parceiros'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Dados pessoais
      table.string('nome_completo').notNullable()
      table.string('cpf_cnpj').notNullable().unique()
      table.string('telefone_contato').notNullable()
      table.string('email').notNullable().unique()
      table.text('especialidades').nullable() // JSON string

      // Serviços habilitados
      table.text('servicos_habilitados').nullable() // JSON string

      // Endereço
      table.string('cep').nullable()
      table.string('rua').nullable()
      table.string('numero').nullable()
      table.string('complemento').nullable()
      table.string('bairro').nullable()
      table.string('cidade').nullable()
      table.string('estado').nullable()

      // Tipo de parceria
      table.enum('tipo_parceria', ['sublocacao', 'porcentagem', 'porcentagem_produto']).notNullable()

      // Configurações financeiras
      table.decimal('valor_sublocacao', 10, 2).nullable()
      table.integer('dia_vencimento_sublocacao').nullable()
      table.decimal('valor_repasse_servico', 10, 2).nullable()
      table.decimal('percentual_clinica', 5, 2).nullable()

      // Dados bancários
      table.string('banco').nullable()
      table.string('agencia').nullable()
      table.string('conta').nullable()
      table.string('pix').nullable()

      // Disponibilidade e bloqueios
      table.text('disponibilidade').nullable() // JSON string
      table.text('observacoes').nullable()
      table.text('bloqueios_datas').nullable() // JSON string

      // Status
      table.boolean('ativo').defaultTo(true)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}