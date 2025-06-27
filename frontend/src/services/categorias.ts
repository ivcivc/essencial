import api from './api'
import { 
  Categoria, 
  CategoriaFormData, 
  CategoriaResponse, 
  CategoriasResponse, 
  CategoriasPorTipoResponse,
  CheckNomeResponse 
} from '../types/categorias'

export class CategoriasService {
  private static baseUrl = '/categorias'

  /**
   * Listar categorias com paginação e filtros
   */
  static async listar(params?: {
    page?: number
    limit?: number
    search?: string
    tipo?: 'produto' | 'servico'
    ativo?: 'true' | 'false' | 'all'
  }): Promise<CategoriasResponse> {
    const response = await api.get(this.baseUrl, { params })
    return response.data
  }

  /**
   * Buscar categoria por ID
   */
  static async buscarPorId(id: number): Promise<CategoriaResponse> {
    const response = await api.get(`${this.baseUrl}/${id}`)
    return response.data
  }

  /**
   * Criar nova categoria
   */
  static async criar(dados: CategoriaFormData): Promise<CategoriaResponse> {
    const response = await api.post(this.baseUrl, dados)
    return response.data
  }

  /**
   * Atualizar categoria
   */
  static async atualizar(id: number, dados: Partial<CategoriaFormData>): Promise<CategoriaResponse> {
    const response = await api.put(`${this.baseUrl}/${id}`, dados)
    return response.data
  }

  /**
   * Excluir categoria
   */
  static async excluir(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`${this.baseUrl}/${id}`)
    return response.data
  }

  /**
   * Buscar categorias por tipo
   */
  static async buscarPorTipo(tipo: 'produto' | 'servico'): Promise<CategoriasPorTipoResponse> {
    const response = await api.get(`${this.baseUrl}/tipo/${tipo}`)
    return response.data
  }

  /**
   * Verificar se nome da categoria é único
   */
  static async verificarNome(nome: string, tipo: 'produto' | 'servico', id?: number): Promise<CheckNomeResponse> {
    const params = { nome, tipo, ...(id && { id }) }
    const response = await api.get(`${this.baseUrl}/check-nome`, { params })
    return response.data
  }

  /**
   * Helpers para formatação
   */
  static formatarTipo(tipo: 'produto' | 'servico'): string {
    return tipo === 'produto' ? 'Produto' : 'Serviço'
  }

  static formatarStatus(ativo: boolean): string {
    return ativo ? 'Ativo' : 'Inativo'
  }

  static formatarSistema(sistema: boolean): string {
    return sistema ? 'Sistema' : 'Personalizada'
  }

  static obterCorStatus(ativo: boolean): string {
    return ativo 
      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  static obterCorTipo(tipo: 'produto' | 'servico'): string {
    return tipo === 'produto'
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  }

  static obterCorSistema(sistema: boolean): string {
    return sistema
      ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  }
} 