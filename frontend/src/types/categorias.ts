export interface Categoria {
  id: number
  nome: string
  tipo: 'produto' | 'servico'
  descricao?: string
  ativo: boolean
  sistema: boolean
  createdAt: string
  updatedAt: string
}

export interface CategoriaFormData {
  nome: string
  tipo: 'produto' | 'servico'
  descricao?: string
  ativo?: boolean
}

export interface CategoriaResponse {
  success: boolean
  data: Categoria
  message: string
}

export interface CategoriasResponse {
  success: boolean
  data: {
    data: Categoria[]
    meta: {
      total: number
      current_page: number
      last_page: number
      per_page: number
    }
  }
  message: string
}

export interface CategoriasPorTipoResponse {
  success: boolean
  data: Categoria[]
  message: string
}

export interface CheckNomeResponse {
  success: boolean
  existe: boolean
  message: string
} 