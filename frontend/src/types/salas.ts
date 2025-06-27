export interface Sala {
  id: number;
  nome: string;
  descricao: string | null;
  recursos: string[] | null;
  ativa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalaFormData {
  nome: string;
  descricao?: string;
  recursos?: string[];
  ativa?: boolean;
}

export interface SalaResponse {
  success: boolean;
  data: Sala;
  message?: string;
}

export interface SalasListResponse {
  success: boolean;
  data: {
    data: Sala[];
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

export interface SalaSearchResponse {
  success: boolean;
  data: Sala[];
}

export interface CheckNomeResponse {
  success: boolean;
  disponivel: boolean;
  message: string;
} 