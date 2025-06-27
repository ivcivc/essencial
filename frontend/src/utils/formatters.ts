/**
 * Utilitários para formatação de campos
 */

// Formatador de valores monetários
export const formatMoney = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Se não há números, retorna vazio
  if (!numbers) return '';
  
  // Converte para número e formata
  const numberValue = parseInt(numbers) / 100;
  
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Parser de valores monetários (converte de string formatada para número)
export const parseMoney = (value: string): number => {
  if (!value) return 0;
  
  // Remove símbolo monetário (R$) e espaços
  let cleanValue = value.replace(/[R$\s]/g, '');
  
  // Se tem vírgula, é o separador decimal brasileiro
  if (cleanValue.includes(',')) {
    // Remove pontos (separadores de milhares) e substitui vírgula por ponto
    cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
  }
  
  const result = parseFloat(cleanValue) || 0;
  return result;
};

// Formatador de CPF
export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return value;
};

// Formatador de CNPJ
export const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 14) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return value;
};

// Formatador automático de CPF/CNPJ
export const formatCPFCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 11) {
    // CPF: 000.000.000-00
    if (numbers.length >= 4) {
      return numbers.replace(/(\d{3})(\d{0,3})(\d{0,3})(\d{0,2})/, (_, p1, p2, p3, p4) => {
        let result = p1;
        if (p2) result += '.' + p2;
        if (p3) result += '.' + p3;
        if (p4) result += '-' + p4;
        return result;
      });
    }
    return numbers;
  } else {
    // CNPJ: 00.000.000/0000-00
    return numbers.replace(/(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/, (_, p1, p2, p3, p4, p5) => {
      let result = p1;
      if (p2) result += '.' + p2;
      if (p3) result += '.' + p3;
      if (p4) result += '/' + p4;
      if (p5) result += '-' + p5;
      return result;
    });
  }
};

// Formatador de CEP
export const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 8) {
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  
  return value;
};

// Formatador de telefone
export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  // Celular (11 dígitos): (XX) XXXXX-XXXX
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  // Fixo (10 dígitos): (XX) XXXX-XXXX
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  // Durante a digitação
  if (numbers.length <= 2) {
    return numbers.length > 0 ? `(${numbers}` : '';
  } else if (numbers.length <= 6) {
    return numbers.replace(/(\d{2})(\d+)/, '($1) $2');
  } else if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  } else {
    return numbers.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
  }
};

// Remove formatação de todos os campos
export const removeFormatting = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Valida CPF
export const isValidCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os números são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Calcula os dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(numbers[9]) !== digit1) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(numbers[10]) === digit2;
};

// Valida CNPJ
export const isValidCNPJ = (cnpj: string): boolean => {
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return false;
  
  // Verifica se todos os números são iguais
  if (/^(\d)\1{13}$/.test(numbers)) return false;
  
  // Calcula primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(numbers[12]) !== digit1) return false;
  
  // Calcula segundo dígito verificador
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(numbers[13]) === digit2;
};

// Valida CPF ou CNPJ automaticamente
export const isValidCPFCNPJ = (value: string): boolean => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    return isValidCPF(value);
  } else if (numbers.length === 14) {
    return isValidCNPJ(value);
  }
  
  return false;
}; 