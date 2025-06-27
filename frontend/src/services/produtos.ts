import api from './api'
import type {
  Produto,
  ProdutoFormData,
  ProdutosFiltros,
  ProdutosResponse,
  ProdutoResponse,
  ProdutoSearchResponse,
  CodigoInternoCheckResponse
} from '../types/produtos'

export class ProdutosService {
  /**
   * Listar produtos com paginação e filtros
   */
  static async listar(
    page = 1,
    limit = 10,
    filtros?: ProdutosFiltros
  ): Promise<ProdutosResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    if (filtros?.search) {
      params.append('search', filtros.search)
    }

    if (filtros?.tipo) {
      params.append('tipo', filtros.tipo)
    }

    if (filtros?.categoria) {
      params.append('categoria', filtros.categoria)
    }

    if (filtros?.parceiroId) {
      params.append('parceiroId', filtros.parceiroId.toString())
    }

    if (filtros?.ativo !== undefined) {
      params.append('ativo', filtros.ativo.toString())
    }

    if (filtros?.disponivelAgendamento !== undefined) {
      params.append('disponivelAgendamento', filtros.disponivelAgendamento.toString())
    }

    if (filtros?.estoqueBaixo !== undefined) {
      params.append('estoqueBaixo', filtros.estoqueBaixo.toString())
    }

    const response = await api.get(`/produtos?${params.toString()}`)
    return response.data
  }

  /**
   * Buscar produto por ID
   */
  static async buscarPorId(id: number): Promise<ProdutoResponse> {
    const response = await api.get(`/produtos/${id}`)
    return response.data
  }

  /**
   * Criar novo produto
   */
  static async criar(data: ProdutoFormData): Promise<ProdutoResponse> {
    // Limpar campos vazios
    const cleanData = this.limparDadosFormulario(data)
    
    const response = await api.post('/produtos', cleanData)
    return response.data
  }

  /**
   * Atualizar produto
   */
  static async atualizar(id: number, data: Partial<ProdutoFormData>): Promise<ProdutoResponse> {
    // Limpar campos vazios
    const cleanData = this.limparDadosFormulario(data)
    
    const response = await api.put(`/produtos/${id}`, cleanData)
    return response.data
  }

  /**
   * Excluir produto (soft delete)
   */
  static async excluir(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/produtos/${id}`)
    return response.data
  }

  /**
   * Buscar produtos por termo
   */
  static async buscarPorTermo(termo: string): Promise<ProdutoSearchResponse> {
    const response = await api.post('/produtos/search', { termo })
    return response.data
  }

  /**
   * Verificar se código interno já existe
   */
  static async verificarCodigoInterno(
    codigoInterno: string,
    produtoId?: number
  ): Promise<CodigoInternoCheckResponse> {
    const response = await api.post('/produtos/check-codigo-interno', {
      codigoInterno,
      produtoId
    })
    return response.data
  }

  /**
   * Buscar produtos com estoque baixo
   */
  static async buscarEstoqueBaixo(): Promise<ProdutoSearchResponse> {
    const response = await api.get('/produtos/estoque-baixo')
    return response.data
  }

  /**
   * Baixar estoque de um produto
   */
  static async baixarEstoque(id: number, quantidade = 1): Promise<ProdutoResponse> {
    const response = await api.patch(`/produtos/${id}/baixar-estoque`, { quantidade })
    return response.data
  }

  /**
   * Repor estoque de um produto
   */
  static async reporEstoque(id: number, quantidade: number): Promise<ProdutoResponse> {
    const response = await api.patch(`/produtos/${id}/repor-estoque`, { quantidade })
    return response.data
  }

  /**
   * Listar apenas serviços ativos para agendamento
   */
  static async listarServicos(): Promise<ProdutosResponse> {
    return await this.listar(1, 100, {
      tipo: 'servico',
      ativo: true,
      disponivelAgendamento: true
    })
  }

  /**
   * Listar todos os serviços ativos (incluindo indisponíveis para agendamento)
   * Usado quando queremos mostrar os indisponíveis com destaque visual
   */
  static async listarTodosServicos(): Promise<ProdutosResponse> {
    return await this.listar(1, 100, {
      tipo: 'servico',
      ativo: true
    })
  }

  /**
   * Limpar dados do formulário removendo campos vazios e nulos
   */
  private static limparDadosFormulario(data: any): any {
    const cleanData: any = {}

    Object.keys(data).forEach(key => {
      const value = data[key]
      
      // Manter valores booleanos, números 0 e arrays vazios
      if (value !== null && value !== undefined && value !== '') {
        cleanData[key] = value
      }
      
      // Para campos específicos que podem ser null/undefined
      if (['precoCusto', 'precoParceiro', 'duracaoMinutos', 'estoqueAtual', 'estoqueMinimo', 'parceiroId'].includes(key)) {
        if (value === '' || value === undefined) {
          cleanData[key] = null
        } else if (value !== null) {
          cleanData[key] = value
        }
      }
    })

    return cleanData
  }

  /**
   * Formatadores de dados
   */
  static formatarPreco(valor: number | null): string {
    if (valor === null || valor === undefined) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  static formatarDuracao(minutos: number | null): string {
    if (!minutos) return '-'
    
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    
    if (horas > 0) {
      return `${horas}h${mins > 0 ? ` ${mins}min` : ''}`
    }
    
    return `${mins}min`
  }

  static formatarTags(tags: string[] | null): string {
    if (!tags || tags.length === 0) return '-'
    return tags.join(', ')
  }

  static formatarCategoria(categoria: string): string {
    const categorias: { [key: string]: string } = {
      // Produtos
      'suplemento': 'Suplemento',
      'cosmetico': 'Cosmético',
      'equipamento': 'Equipamento',
      'medicamento': 'Medicamento',
      'higiene': 'Higiene',
      
      // Serviços
      'consulta': 'Consulta',
      'acupuntura': 'Acupuntura',
      'psicologia': 'Psicologia',
      'nutricao': 'Nutrição',
      'massagem': 'Massagem',
      'estetica': 'Estética',
      'fisioterapia': 'Fisioterapia',
      'procedimento': 'Procedimento',
      
      'outros': 'Outros'
    }
    
    return categorias[categoria] || categoria
  }

  static formatarTipo(tipo: string): string {
    return tipo === 'produto' ? 'Produto' : 'Serviço'
  }

  static formatarRequerPreparo(requerPreparo: boolean): string {
    return requerPreparo ? 'Sim' : 'Não'
  }

  /**
   * Helpers para status
   */
  static obterStatusEstoque(produto: Produto): {
    texto: string
    cor: string
    icone: string
  } {
    // Para serviços, não mostrar informações de estoque
    if (produto.tipo === 'servico') {
      return {
        texto: 'Serviço',
        cor: 'text-purple-600 dark:text-purple-400',
        icone: 'cog'
      }
    }

    if (!produto.controlaEstoque) {
      return {
        texto: 'Não controlado',
        cor: 'text-gray-500 dark:text-gray-400',
        icone: 'minus-circle'
      }
    }

    if (produto.isEstoqueBaixo) {
      return {
        texto: 'Estoque baixo',
        cor: 'text-red-600 dark:text-red-400',
        icone: 'exclamation-triangle'
      }
    }

    if (produto.temEstoque) {
      return {
        texto: 'Em estoque',
        cor: 'text-primary-600 dark:text-primary-400',
        icone: 'check-circle'
      }
    }

    return {
      texto: 'Sem estoque',
      cor: 'text-red-600 dark:text-red-400',
      icone: 'x-circle'
    }
  }

  static obterStatusAgendamento(produto: Produto): {
    texto: string
    cor: string
  } {
    if (!produto.disponivelAgendamento) {
      return {
        texto: 'Indisponível',
        cor: 'text-gray-500 dark:text-gray-400'
      }
    }

    if (produto.podeSerAgendado) {
      return {
        texto: 'Disponível',
        cor: 'text-primary-600 dark:text-primary-400'
      }
    }

    return {
      texto: 'Bloqueado',
      cor: 'text-red-600 dark:text-red-400'
    }
  }

  /**
   * Buscar salas vinculadas a um serviço
   */
  static async buscarSalasDoServico(servicoId: number) {
    const response = await api.get(`/servicos/${servicoId}/salas`);
    return response.data;
  }
} 