import api from './api';
import type { 
  Parceiro, 
  ParceiroFormData, 
  ParceiroResponse, 
  ParceirosListResponse, 
  ParceiroSearchResponse,
  CheckCpfCnpjResponse,
  CheckEmailResponse,
  TipoParceria,
  ServicosResponse
} from '../types/parceiros';

export class ParceirosService {
  /**
   * Listar parceiros com paginação e filtros
   */
  static async listar(
    page: number = 1,
    limit: number = 10,
    search?: string,
    ativas?: boolean,
    tipoParceria?: TipoParceria,
    especialidade?: string
  ): Promise<ParceirosListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);
    if (ativas !== undefined) params.append('ativas', ativas.toString());
    if (tipoParceria) params.append('tipoParceria', tipoParceria);
    if (especialidade) params.append('especialidade', especialidade);

    const response = await api.get(`/parceiros?${params.toString()}`);
    return response.data;
  }

  /**
   * Buscar parceiro por ID
   */
  static async buscarPorId(id: number): Promise<ParceiroResponse> {
    const response = await api.get(`/parceiros/${id}`);
    return response.data;
  }

  /**
   * Criar novo parceiro
   */
  static async criar(data: ParceiroFormData): Promise<ParceiroResponse> {
    const response = await api.post('/parceiros', data);
    return response.data;
  }

  /**
   * Atualizar parceiro
   */
  static async atualizar(id: number, data: Partial<ParceiroFormData>): Promise<ParceiroResponse> {
    const response = await api.put(`/parceiros/${id}`, data);
    return response.data;
  }

  /**
   * Excluir parceiro (soft delete)
   */
  static async excluir(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/parceiros/${id}`);
    return response.data;
  }

  /**
   * Buscar parceiros por termo
   */
  static async buscar(termo: string): Promise<ParceiroSearchResponse> {
    const response = await api.post('/parceiros/search', { termo });
    return response.data;
  }

  /**
   * Verificar se CPF/CNPJ é único
   */
  static async verificarCpfCnpj(cpfCnpj: string, id?: number): Promise<CheckCpfCnpjResponse> {
    const data: { cpfCnpj: string; id?: number } = { cpfCnpj };
    if (id) data.id = id;
    
    const response = await api.post('/parceiros/check-cpf-cnpj', data);
    return response.data;
  }

  /**
   * Verificar se email é único
   */
  static async verificarEmail(email: string, id?: number): Promise<CheckEmailResponse> {
    const data: { email: string; id?: number } = { email };
    if (id) data.id = id;
    
    const response = await api.post('/parceiros/check-email', data);
    return response.data;
  }

  /**
   * Listar apenas parceiros ativos (para seleções)
   */
  static async listarAtivos(): Promise<Parceiro[]> {
    const response = await this.listar(1, 100, undefined, true);
    return response.data.data;
  }

  /**
   * Buscar parceiros por tipo de parceria
   */
  static async buscarPorTipo(tipoParceria: TipoParceria): Promise<Parceiro[]> {
    const response = await this.listar(1, 100, undefined, true, tipoParceria);
    return response.data.data;
  }

  /**
   * Buscar parceiros por especialidade
   */
  static async buscarPorEspecialidade(especialidade: string): Promise<Parceiro[]> {
    const response = await this.listar(1, 100, undefined, true, undefined, especialidade);
    return response.data.data;
  }

  /**
   * Formatar tipo de parceria para exibição
   */
  static formatarTipoParceria(tipo: TipoParceria): string {
    const tipos = {
      sublocacao: 'Sublocação',
      porcentagem: 'Porcentagem',
      porcentagem_produto: 'Porcentagem com Produto'
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Formatar especialidades para exibição
   */
  static formatarEspecialidades(especialidades: string[]): string {
    if (!especialidades || especialidades.length === 0) {
      return 'Nenhuma especialidade cadastrada';
    }
    
    if (especialidades.length <= 2) {
      return especialidades.join(', ');
    }
    
    return `${especialidades.slice(0, 2).join(', ')} e mais ${especialidades.length - 2}`;
  }

  /**
   * Formatar disponibilidade para exibição
   */
  static formatarDisponibilidade(disponibilidade?: any): string {
    if (!disponibilidade) return 'Não informada';

    const dias = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
    const nomesDias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    
    const diasAtivos = dias
      .map((dia, index) => {
        const diaData = disponibilidade[dia];
        if (diaData?.ativo) {
          return `${nomesDias[index]} (${diaData.inicio}-${diaData.fim})`;
        }
        return null;
      })
      .filter(Boolean);

    if (diasAtivos.length === 0) return 'Nenhum dia ativo';
    if (diasAtivos.length <= 3) return diasAtivos.join(', ');
    
    return `${diasAtivos.slice(0, 3).join(', ')} e mais ${diasAtivos.length - 3}`;
  }

  /**
   * Formatar valor monetário
   */
  static formatarValor(valor?: number): string {
    if (!valor) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

  /**
   * Formatar CPF/CNPJ
   */
  static formatarCpfCnpj(cpfCnpj: string): string {
    const numbers = cpfCnpj.replace(/\D/g, '');
    
    if (numbers.length === 11) {
      // CPF
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (numbers.length === 14) {
      // CNPJ
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return cpfCnpj;
  }

  /**
   * Buscar serviços ativos para associação
   */
  static async buscarServicosAtivos(): Promise<ServicosResponse> {
    const response = await api.get('/produtos/servicos-ativos');
    return response.data;
  }

  /**
   * Formatar telefone
   */
  static formatarTelefone(telefone: string): string {
    const numbers = telefone.replace(/\D/g, '');
    
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return telefone;
  }

  /**
   * Obter disponibilidade do parceiro
   */
  static async obterDisponibilidade(id: number): Promise<any> {
    const response = await api.get(`/parceiros/${id}/disponibilidade`);
    return response.data;
  }

  /**
   * Atualizar disponibilidade do parceiro
   */
  static async atualizarDisponibilidade(id: number, disponibilidade: any): Promise<any> {
    const response = await api.put(`/parceiros/${id}/disponibilidade`, { disponibilidade });
    return response.data;
  }

  /**
   * Obter disponibilidade padrão para novos parceiros
   */
  static obterDisponibilidadePadrao(): any {
    return {
      seg: { inicio: '08:00', fim: '18:00', ativo: true },
      ter: { inicio: '08:00', fim: '18:00', ativo: true },
      qua: { inicio: '08:00', fim: '18:00', ativo: true },
      qui: { inicio: '08:00', fim: '18:00', ativo: true },
      sex: { inicio: '08:00', fim: '17:00', ativo: true },
      sab: { inicio: '08:00', fim: '12:00', ativo: false },
      dom: { inicio: '08:00', fim: '12:00', ativo: false }
    };
  }

  /**
   * Validar se parceiro está disponível em um dia específico
   */
  static validarDisponibilidadeDia(disponibilidade: any, diaSemana: string): boolean {
    const mapeamentoDias: Record<number, string> = {
      0: 'dom', 1: 'seg', 2: 'ter', 3: 'qua', 4: 'qui', 5: 'sex', 6: 'sab'
    };
    
    const diaKey = typeof diaSemana === 'string' ? diaSemana : mapeamentoDias[diaSemana];
    const diaConfig = disponibilidade?.[diaKey];
    
    return diaConfig?.ativo === true;
  }

  /**
   * Buscar disponibilidade do parceiro para uma data
   */
  static async buscarDisponibilidade(parceiroId: number, data: string) {
    const response = await api.get(`/parceiros/${parceiroId}/disponibilidade-data?data=${data}`);
    return response.data;
  }
} 