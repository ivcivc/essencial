import api from './api';
import { Paciente, PacientesResponse, PacienteFormData } from '../types/Paciente';

export const pacientesService = {
  // Listar pacientes com busca e paginação
  async listar(search?: string, page = 1, limit = 20): Promise<PacientesResponse> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/pacientes?${params.toString()}`);
    return response.data;
  },

  // Buscar paciente por ID
  async buscarPorId(id: number): Promise<{ paciente: Paciente }> {
    const response = await api.get(`/pacientes/${id}`);
    return response.data;
  },

  // Criar novo paciente
  async criar(dadosPaciente: PacienteFormData): Promise<{ message: string; paciente: Paciente }> {
    const response = await api.post('/pacientes', dadosPaciente);
    return response.data;
  },

  // Atualizar paciente
  async atualizar(id: number, dadosPaciente: Partial<PacienteFormData>): Promise<{ message: string; paciente: Paciente }> {
    const response = await api.put(`/pacientes/${id}`, dadosPaciente);
    return response.data;
  },

  // Excluir paciente (soft delete)
  async excluir(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/pacientes/${id}`);
    return response.data;
  },

  // Busca avançada
  async buscar(termo: string): Promise<{ pacientes: Paciente[] }> {
    const response = await api.post('/pacientes/search', { termo });
    return response.data;
  },

  // Verificar se CPF já existe
  async verificarCpf(cpf: string): Promise<{ exists: boolean; paciente?: { id: number; nomeCompleto: string } }> {
    const response = await api.post('/pacientes/check-cpf', { cpf });
    return response.data;
  },

  // Buscar CEP via API dos Correios
  async buscarCep(cep: string): Promise<{
    cep: string;
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean;
  }> {
    const cleanCep = cep.replace(/\D/g, '');
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return data;
  }
}; 