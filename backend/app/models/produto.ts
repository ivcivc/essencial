import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany, beforeSave, afterFind } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Parceiro from './parceiro.js'
import Sala from './sala.js'

export type TipoProduto = 'produto' | 'servico'

export default class Produto extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Dados básicos
  @column()
  declare nome: string

  @column()
  declare descricao: string | null

  @column()
  declare tipo: TipoProduto

  @column()
  declare categoria: string

  // Preços
  @column()
  declare precoVenda: number

  @column()
  declare precoCusto: number | null

  @column()
  declare precoParceiro: number | null

  // Duração (para serviços)
  @column()
  declare duracaoMinutos: number | null

  // Estoque (para produtos)
  @column()
  declare estoqueAtual: number | null

  @column()
  declare estoqueMinimo: number | null

  @column()
  declare controlaEstoque: boolean

  // Relacionamentos
  @column()
  declare parceiroId: number | null

  @belongsTo(() => Parceiro)
  declare parceiro: BelongsTo<typeof Parceiro>

  // Relacionamento com salas (many-to-many)
  @manyToMany(() => Sala, {
    pivotTable: 'produto_salas',
  })
  declare salas: ManyToMany<typeof Sala>

  // Configurações
  @column()
  declare disponivelAgendamento: boolean

  @column()
  declare requerPreparo: boolean

  @column()
  declare instrucoesPreparo: string | null

  // Tags e classificação
  @column()
  declare tags: string[] | string | null

  @column()
  declare codigoInterno: string | null

  // Observações e status
  @column()
  declare observacoes: string | null

  @column()
  declare ativo: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Hooks para serialização JSON
  @beforeSave()
  static async serializeJsonFields(produto: Produto) {
    if (produto.tags && Array.isArray(produto.tags)) {
      produto.tags = JSON.stringify(produto.tags)
    }
  }

  @afterFind()
  static async deserializeJsonFields(produto: Produto) {
    if (produto.tags) {
      if (typeof produto.tags === 'string') {
        try {
          produto.tags = JSON.parse(produto.tags)
        } catch {
          produto.tags = []
        }
      }
    } else {
      produto.tags = []
    }
    
    // Garantir que tags seja sempre um array
    if (!Array.isArray(produto.tags)) {
      produto.tags = []
    }
  }

  // Métodos de busca
  static async findActive() {
    return await this.query()
      .where('ativo', true)
      .orderBy('nome', 'asc')
  }

  static async findByTipo(tipo: TipoProduto) {
    return await this.query()
      .where('ativo', true)
      .where('tipo', tipo)
      .orderBy('nome', 'asc')
  }

  static async findByCategoria(categoria: string) {
    return await this.query()
      .where('ativo', true)
      .where('categoria', categoria)
      .orderBy('nome', 'asc')
  }

  static async findByParceiro(parceiroId: number) {
    return await this.query()
      .where('ativo', true)
      .where('parceiro_id', parceiroId)
      .orderBy('nome', 'asc')
  }

  static async findByCodigoInterno(codigo: string) {
    return await this.findBy('codigo_interno', codigo)
  }

  // Busca por termo geral
  static async search(termo: string) {
    return await this.query()
      .where('ativo', true)
      .where((query) => {
        query
          .whereILike('nome', `%${termo}%`)
          .orWhereILike('descricao', `%${termo}%`)
          .orWhereILike('categoria', `%${termo}%`)
          .orWhereILike('codigo_interno', `%${termo}%`)
      })
      .orderBy('nome', 'asc')
  }

  // Busca produtos com estoque baixo
  static async findComEstoqueBaixo() {
    return await this.query()
      .where('ativo', true)
      .where('controla_estoque', true)
      .whereRaw('estoque_atual <= estoque_minimo')
      .orderBy('estoque_atual', 'asc')
  }

  // Busca produtos disponíveis para agendamento
  static async findDisponivelAgendamento() {
    return await this.query()
      .where('ativo', true)
      .where('disponivel_agendamento', true)
      .orderBy('nome', 'asc')
  }

  // Métodos de validação
  get isEstoqueBaixo(): boolean {
    if (!this.controlaEstoque || this.estoqueAtual === null || this.estoqueMinimo === null) {
      return false
    }
    return this.estoqueAtual <= this.estoqueMinimo
  }

  get temEstoque(): boolean {
    if (!this.controlaEstoque) {
      return true // Se não controla estoque, sempre disponível
    }
    return this.estoqueAtual !== null && this.estoqueAtual > 0
  }

  get podeSerAgendado(): boolean {
    return this.ativo && this.disponivelAgendamento && this.temEstoque
  }

  // Método para baixar estoque
  async baixarEstoque(quantidade: number = 1): Promise<boolean> {
    if (!this.controlaEstoque || this.estoqueAtual === null) {
      return true // Se não controla estoque, sempre sucesso
    }

    if (this.estoqueAtual < quantidade) {
      return false // Estoque insuficiente
    }

    this.estoqueAtual -= quantidade
    await this.save()
    return true
  }

  // Método para repor estoque
  async reporEstoque(quantidade: number): Promise<void> {
    if (this.controlaEstoque && this.estoqueAtual !== null) {
      this.estoqueAtual += quantidade
      await this.save()
    }
  }

  // Serialização personalizada
  serialize() {
    const baseData = {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      tipo: this.tipo,
      categoria: this.categoria,
      precoVenda: this.precoVenda,
      precoCusto: this.precoCusto,
      precoParceiro: this.precoParceiro,
      duracaoMinutos: this.duracaoMinutos,
      estoqueAtual: this.estoqueAtual,
      estoqueMinimo: this.estoqueMinimo,
      controlaEstoque: this.controlaEstoque,
      parceiroId: this.parceiroId,
      disponivelAgendamento: this.disponivelAgendamento,
      requerPreparo: this.requerPreparo,
      instrucoesPreparo: this.instrucoesPreparo,
      tags: Array.isArray(this.tags) ? this.tags : [],
      codigoInterno: this.codigoInterno,
      observacoes: this.observacoes,
      ativo: this.ativo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // Propriedades computadas
      isEstoqueBaixo: this.isEstoqueBaixo,
      temEstoque: this.temEstoque,
      podeSerAgendado: this.podeSerAgendado,
    }

    // Incluir relacionamentos se estiverem carregados
    const serialized = super.serialize()
    if (serialized.parceiro) {
      baseData.parceiro = serialized.parceiro
    }
    if (serialized.salas) {
      baseData.salas = serialized.salas
    }

    return baseData
  }
}