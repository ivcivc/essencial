export type TipoProduto = 'produto' | 'servico'

export interface Produto {
  id: number
  nome: string
  descricao: string | null
  tipo: TipoProduto
  categoria: string
  precoVenda: number
  precoCusto: number | null
  precoParceiro: number | null
  duracaoMinutos: number | null
  estoqueAtual: number | null
  estoqueMinimo: number | null
  controlaEstoque: boolean
  parceiroId: number | null
  disponivelAgendamento: boolean
  requerPreparo: boolean
  instrucoesPreparo: string | null
  tags: string[] | null
  codigoInterno: string | null
  observacoes: string | null
  ativo: boolean
  createdAt: string
  updatedAt: string
  // Propriedades computadas
  isEstoqueBaixo?: boolean
  temEstoque?: boolean
  podeSerAgendado?: boolean
  // Relacionamentos
  parceiro?: {
    id: number
    nomeCompleto: string
    tipoParceria: string
  }
  salas?: Array<{
    id: number
    nome: string
    descricao: string | null
    ativa: boolean
  }>
}

export interface ProdutoFormData {
  nome: string
  descricao?: string
  tipo: TipoProduto
  categoria: string
  precoVenda: number
  precoCusto?: number
  precoParceiro?: number
  duracaoMinutos?: number
  estoqueAtual?: number
  estoqueMinimo?: number
  controlaEstoque: boolean
  parceiroId?: number
  disponivelAgendamento: boolean
  requerPreparo: boolean
  instrucoesPreparo?: string
  tags?: string[]
  codigoInterno?: string
  observacoes?: string
  ativo?: boolean
  salaIds?: number[]
}

export interface ProdutosFiltros {
  search?: string
  tipo?: TipoProduto
  categoria?: string
  parceiroId?: number
  ativo?: boolean
  disponivelAgendamento?: boolean
  estoqueBaixo?: boolean
}

export interface ProdutosResponse {
  success: boolean
  data: {
    data: Produto[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
      firstPage: number
      firstPageUrl: string
      lastPageUrl: string
      nextPageUrl: string | null
      previousPageUrl: string | null
    }
  }
}

export interface ProdutoResponse {
  success: boolean
  data: Produto
}

export interface ProdutoSearchResponse {
  success: boolean
  data: Produto[]
}

export interface CodigoInternoCheckResponse {
  success: boolean
  data: {
    existe: boolean
  }
}

// Categorias padrão do sistema
export const CATEGORIAS_PRODUTO = [
  'suplemento',
  'cosmetico',
  'equipamento',
  'medicamento',
  'higiene',
  'outros'
] as const

export const CATEGORIAS_SERVICO = [
  'consulta',
  'acupuntura',
  'psicologia',
  'nutricao',
  'massagem',
  'estetica',
  'fisioterapia',
  'procedimento',
  'outros'
] as const

export type CategoriaProduto = typeof CATEGORIAS_PRODUTO[number]
export type CategoriaServico = typeof CATEGORIAS_SERVICO[number] 