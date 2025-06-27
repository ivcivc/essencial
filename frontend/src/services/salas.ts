import { api } from './api';
import type {
  Sala,
  SalaFormData,
  SalaResponse,
  SalasListResponse,
  SalaSearchResponse,
  CheckNomeResponse,
} from '../types/salas';

export class SalasService {
  /**
   * Listar salas com paginação e filtros
   */
  static async listar(params?: {
    page?: number;
    limit?: number;
    search?: string;
    ativas?: boolean;
  }): Promise<SalasListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.ativas !== undefined) searchParams.set('ativas', params.ativas.toString());

    const response = await api.get(`/salas?${searchParams.toString()}`);
    return response.data;
  }

  /**
   * Buscar sala por ID
   */
  static async buscarPorId(id: number): Promise<SalaResponse> {
    const response = await api.get(`/salas/${id}`);
    return response.data;
  }

  /**
   * Criar nova sala
   */
  static async criar(data: SalaFormData): Promise<SalaResponse> {
    const response = await api.post('/salas', data);
    return response.data;
  }

  /**
   * Atualizar sala existente
   */
  static async atualizar(id: number, data: Partial<SalaFormData>): Promise<SalaResponse> {
    const response = await api.put(`/salas/${id}`, data);
    return response.data;
  }

  /**
   * Excluir sala (soft delete)
   */
  static async excluir(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/salas/${id}`);
    return response.data;
  }

  /**
   * Buscar salas por termo
   */
  static async buscar(termo: string): Promise<SalaSearchResponse> {
    const response = await api.post('/salas/search', { termo });
    return response.data;
  }

  /**
   * Verificar se nome é único
   */
  static async verificarNome(nome: string, id?: number): Promise<CheckNomeResponse> {
    const data: { nome: string; id?: number } = { nome };
    if (id) data.id = id;
    
    const response = await api.post('/salas/check-nome', data);
    return response.data;
  }

  /**
   * Buscar salas ativas para seleção
   */
  static async listarAtivas(): Promise<Sala[]> {
    const response = await this.listar({ ativas: true, limit: 100 });
    return response.data.data;
  }
} 