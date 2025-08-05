export type TipoParceria = 'sublocacao' | 'porcentagem' | 'porcentagem_produto';

export interface Disponibilidade {
  seg?: { ativo: boolean; periodos: Array<{ inicio: string; fim: string }> };
  ter?: { ativo: boolean; periodos: Array<{ inicio: string; fim: string }> };
  qua?: { ativo: boolean; periodos: Array<{ inicio: string; fim: string }> };
  qui?: { ativo: boolean; periodos: Array<{ inicio: string; fim: string }> };
  sex?: { ativo: boolean; periodos: Array<{ inicio: string; fim: string }> };
  sab?: { ativo: boolean; periodos: Array<{ inicio: string; fim: string }> };
  dom?: { ativo: boolean; periodos: Array<{ inicio: string; fim: string }> };
}

export interface BloqueioData {
  data: string;
  motivo: string;
}

export interface Parceiro {
  id: number;
  nomeCompleto: string;
  cpfCnpj: string;
  telefoneContato: string;
  email: string;
  especialidades: string[];
  servicosHabilitados?: number[];
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  tipoParceria: TipoParceria;
  valorSublocacao?: number;
  diaVencimentoSublocacao?: number;
  valorRepasseServico?: number;
  percentualClinica?: number;
  banco?: string;
  agencia?: string;
  conta?: string;
  pix?: string;
  disponibilidade?: Disponibilidade;
  observacoes?: string;
  bloqueiosDatas?: BloqueioData[];
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParceiroFormData {
  nomeCompleto: string;
  cpfCnpj: string;
  telefoneContato: string;
  email: string;
  especialidades: string[];
  servicosHabilitados?: number[];
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  tipoParceria: TipoParceria;
  valorSublocacao?: number;
  diaVencimentoSublocacao?: number;
  valorRepasseServico?: number;
  percentualClinica?: number;
  banco?: string;
  agencia?: string;
  conta?: string;
  pix?: string;
  disponibilidade?: Disponibilidade;
  observacoes?: string;
  bloqueiosDatas?: BloqueioData[];
  ativo?: boolean;
}

export interface ParceiroResponse {
  success: boolean;
  data: Parceiro;
  message?: string;
}

export interface ParceirosListResponse {
  success: boolean;
  data: {
    data: Parceiro[];
    meta: {
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
  };
}

export interface ParceiroSearchResponse {
  success: boolean;
  data: Parceiro[];
}

export interface CheckCpfCnpjResponse {
  success: boolean;
  disponivel: boolean;
  message: string;
}

export interface CheckEmailResponse {
  success: boolean;
  disponivel: boolean;
  message: string;
}

export interface ServicoSimples {
  id: number;
  nome: string;
  categoria: string;
  precoVenda: number;
}

export interface ServicosResponse {
  success: boolean;
  data: ServicoSimples[];
}

export interface DisponibilidadePeriodo {
  inicio: string
  fim: string
}

export interface DisponibilidadeDia {
  ativo: boolean
  periodos: DisponibilidadePeriodo[]
}

export interface DisponibilidadeParceiro {
  seg: DisponibilidadeDia
  ter: DisponibilidadeDia
  qua: DisponibilidadeDia
  qui: DisponibilidadeDia
  sex: DisponibilidadeDia
  sab: DisponibilidadeDia
  dom: DisponibilidadeDia
}

export interface DisponibilidadeFormData {
  parceiroId: number
  disponibilidade: DisponibilidadeParceiro
} 