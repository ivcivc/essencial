import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave, afterFind } from '@adonisjs/lucid/orm'

export type TipoParceria = 'sublocacao' | 'porcentagem' | 'porcentagem_produto'

export interface Disponibilidade {
  seg?: { ativo: boolean; periodos: Array<{ inicio: string; fim: string }> }
  ter?: { ativo: boolean; periodos: Array<{ inicio: string; fim: string }> }
  qua?: { ativo: boolean; periodos: Array<{ inicio: string; fim: string }> }
  qui?: { ativo: boolean; periodos: Array<{ inicio: string; fim: string }> }
  sex?: { ativo: boolean; periodos: Array<{ inicio: string; fim: string }> }
  sab?: { ativo: boolean; periodos: Array<{ inicio: string; fim: string }> }
  dom?: { ativo: boolean; periodos: Array<{ inicio: string; fim: string }> }
}

export interface BloqueioData {
  data: string
  motivo: string
}

export default class Parceiro extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Dados pessoais
  @column()
  declare nomeCompleto: string

  @column()
  declare cpfCnpj: string

  @column()
  declare telefoneContato: string

  @column()
  declare email: string

  @column()
  declare especialidades: string[] | string

  // Serviços habilitados
  @column()
  declare servicosHabilitados: number[] | string | null

  // Endereço
  @column()
  declare cep: string | null

  @column()
  declare rua: string | null

  @column()
  declare numero: string | null

  @column()
  declare complemento: string | null

  @column()
  declare bairro: string | null

  @column()
  declare cidade: string | null

  @column()
  declare estado: string | null

  // Tipo de parceria
  @column()
  declare tipoParceria: TipoParceria

  // Configurações financeiras
  @column()
  declare valorSublocacao: number | null

  @column()
  declare diaVencimentoSublocacao: number | null

  @column()
  declare valorRepasseServico: number | null

  @column()
  declare percentualClinica: number | null

  // Dados bancários
  @column()
  declare banco: string | null

  @column()
  declare agencia: string | null

  @column()
  declare conta: string | null

  @column()
  declare pix: string | null

  // Disponibilidade e bloqueios
  @column()
  declare disponibilidade: Disponibilidade | string | null

  @column()
  declare observacoes: string | null

  @column()
  declare bloqueiosDatas: BloqueioData[] | string | null

  // Status
  @column()
  declare ativo: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Hooks para serialização JSON
  @beforeSave()
  static async serializeJsonFields(parceiro: Parceiro) {
    if (parceiro.especialidades && Array.isArray(parceiro.especialidades)) {
      parceiro.especialidades = JSON.stringify(parceiro.especialidades)
    }

    if (parceiro.servicosHabilitados && Array.isArray(parceiro.servicosHabilitados)) {
      parceiro.servicosHabilitados = JSON.stringify(parceiro.servicosHabilitados)
    }

    if (parceiro.disponibilidade && typeof parceiro.disponibilidade === 'object') {
      parceiro.disponibilidade = JSON.stringify(parceiro.disponibilidade)
    }

    if (parceiro.bloqueiosDatas && Array.isArray(parceiro.bloqueiosDatas)) {
      parceiro.bloqueiosDatas = JSON.stringify(parceiro.bloqueiosDatas)
    }
  }

  @afterFind()
  static async deserializeJsonFields(parceiro: Parceiro) {
    if (parceiro.especialidades && typeof parceiro.especialidades === 'string') {
      try {
        parceiro.especialidades = JSON.parse(parceiro.especialidades)
      } catch {
        parceiro.especialidades = []
      }
    }

    if (parceiro.servicosHabilitados && typeof parceiro.servicosHabilitados === 'string') {
      try {
        parceiro.servicosHabilitados = JSON.parse(parceiro.servicosHabilitados)
      } catch {
        parceiro.servicosHabilitados = []
      }
    }

    if (parceiro.disponibilidade && typeof parceiro.disponibilidade === 'string') {
      try {
        parceiro.disponibilidade = JSON.parse(parceiro.disponibilidade)
      } catch {
        parceiro.disponibilidade = null
      }
    }

    if (parceiro.bloqueiosDatas && typeof parceiro.bloqueiosDatas === 'string') {
      try {
        parceiro.bloqueiosDatas = JSON.parse(parceiro.bloqueiosDatas)
      } catch {
        parceiro.bloqueiosDatas = []
      }
    }
  }

  // Método para buscar parceiros ativos
  static async findActive() {
    return await this.query()
      .where('ativo', true)
      .orderBy('nome_completo', 'asc')
  }

  // Método para buscar por CPF/CNPJ
  static async findByCpfCnpj(cpfCnpj: string) {
    return await this.findBy('cpf_cnpj', cpfCnpj)
  }

  // Método para buscar por email
  static async findByEmail(email: string) {
    return await this.findBy('email', email)
  }

  // Método para buscar parceiros com filtros
  static async search(termo: string) {
    return await this.query()
      .where('ativo', true)
      .where((query) => {
        query
          .whereILike('nome_completo', `%${termo}%`)
          .orWhereILike('cpf_cnpj', `%${termo}%`)
          .orWhereILike('email', `%${termo}%`)
          .orWhereILike('telefone_contato', `%${termo}%`)
      })
      .orderBy('nome_completo', 'asc')
  }

  // Método para buscar por tipo de parceria
  static async findByTipoParceria(tipo: TipoParceria) {
    return await this.query()
      .where('ativo', true)
      .where('tipo_parceria', tipo)
      .orderBy('nome_completo', 'asc')
  }

  // Método para buscar por especialidade
  static async findByEspecialidade(especialidade: string) {
    return await this.query()
      .where('ativo', true)
      .whereRaw('JSON_CONTAINS(especialidades, ?)', [`"${especialidade}"`])
      .orderBy('nome_completo', 'asc')
  }

  // Método para buscar parceiros habilitados para um serviço específico
  static async findByServicoHabilitado(servicoId: number) {
    return await this.query()
      .where('ativo', true)
      .whereRaw('JSON_CONTAINS(servicos_habilitados, ?)', [servicoId.toString()])
      .orderBy('nome_completo', 'asc')
  }

  // Método para verificar se parceiro está habilitado para um serviço
  public isHabilitadoParaServico(servicoId: number): boolean {
    if (!this.servicosHabilitados || !Array.isArray(this.servicosHabilitados)) {
      return false
    }
    return this.servicosHabilitados.includes(servicoId)
  }

  // Método para verificar disponibilidade em um dia
  isAvailableOnDay(diaSemana: string): boolean {
    if (!this.disponibilidade || typeof this.disponibilidade === 'string') {
      return false
    }

    const disp = this.disponibilidade as Disponibilidade
    const diaData = disp[diaSemana as keyof Disponibilidade]
    
    return diaData?.ativo === true
  }

  // Método customizado de serialização para API
  serialize() {
    return {
      id: this.id,
      nomeCompleto: this.nomeCompleto,
      cpfCnpj: this.cpfCnpj,
      telefoneContato: this.telefoneContato,
      email: this.email,
      especialidades: Array.isArray(this.especialidades) ? this.especialidades : [],
      servicosHabilitados: Array.isArray(this.servicosHabilitados) ? this.servicosHabilitados : [],
      cep: this.cep,
      rua: this.rua,
      numero: this.numero,
      complemento: this.complemento,
      bairro: this.bairro,
      cidade: this.cidade,
      estado: this.estado,
      tipoParceria: this.tipoParceria,
      valorSublocacao: this.valorSublocacao,
      diaVencimentoSublocacao: this.diaVencimentoSublocacao,
      valorRepasseServico: this.valorRepasseServico,
      percentualClinica: this.percentualClinica,
      banco: this.banco,
      agencia: this.agencia,
      conta: this.conta,
      pix: this.pix,
      disponibilidade: typeof this.disponibilidade === 'object' ? this.disponibilidade : null,
      observacoes: this.observacoes,
      bloqueiosDatas: Array.isArray(this.bloqueiosDatas) ? this.bloqueiosDatas : [],
      ativo: this.ativo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}