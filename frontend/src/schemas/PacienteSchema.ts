import { z } from 'zod';

// Função para validar CPF
const isValidCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  if (checkDigit !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  checkDigit = 11 - (sum % 11);
  if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
  if (checkDigit !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

// Função para validar CEP
const isValidCEP = (cep: string): boolean => {
  const cleanCEP = cep.replace(/[^\d]/g, '');
  return cleanCEP.length === 8;
};

export const PacienteSchema = z.object({
  nomeCompleto: z
    .string()
    .min(1, 'Nome completo é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .refine(isValidCPF, 'CPF inválido'),
  
  dataNascimento: z
    .string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
      return selectedDate <= today && selectedDate >= minDate;
    }, 'Data de nascimento inválida'),
  
  telefoneFixo: z
    .string()
    .optional()
    .refine((phone) => !phone || phone.replace(/[^\d]/g, '').length >= 10, 
      'Telefone deve ter pelo menos 10 dígitos'),
  
  whatsapp: z
    .string()
    .optional()
    .refine((phone) => !phone || phone.replace(/[^\d]/g, '').length >= 10, 
      'WhatsApp deve ter pelo menos 10 dígitos'),
  
  email: z
    .string()
    .optional()
    .refine((email) => !email || z.string().email().safeParse(email).success, 
      'E-mail inválido'),
  
  cep: z
    .string()
    .optional()
    .refine((cep) => !cep || isValidCEP(cep), 'CEP inválido'),
  
  rua: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  
  estado: z
    .string()
    .optional()
    .refine((estado) => !estado || estado.length === 2, 'Estado deve ter 2 caracteres'),
  
  comoConheceuClinica: z.string().optional(),
  indicacoes: z.string().optional(),
  observacoesGerais: z.string().optional(),
});

export type PacienteFormData = z.infer<typeof PacienteSchema>; 