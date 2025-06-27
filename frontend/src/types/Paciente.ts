export interface Paciente {
  id?: number;
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  telefoneFixo?: string;
  whatsapp?: string;
  email?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  comoConheceuClinica?: string;
  indicacoes?: string;
  observacoesGerais?: string;
  ativo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PacientesResponse {
  pacientes: Paciente[];
  meta?: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
    firstPageUrl: string;
    lastPageUrl: string;
    nextPageUrl: string | null;
    previousPageUrl: string | null;
  };
}

export interface PacienteFormData {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  telefoneFixo: string;
  whatsapp: string;
  email: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  comoConheceuClinica: string;
  indicacoes: string;
  observacoesGerais: string;
} 