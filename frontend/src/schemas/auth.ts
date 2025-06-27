import { z } from 'zod';

// Schema para login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ter um formato válido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

// Schema para criação de usuário
export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ter um formato válido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  role: z
    .enum(['admin', 'recepcionista'], {
      errorMap: () => ({ message: 'Perfil deve ser Admin ou Recepcionista' }),
    }),
  active: z.boolean().default(true),
});

// Schema para atualização de usuário
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  email: z
    .string()
    .email('Email deve ter um formato válido')
    .optional(),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .optional()
    .or(z.literal('')), // Permite string vazia para não alterar senha
  role: z
    .enum(['admin', 'recepcionista'], {
      errorMap: () => ({ message: 'Perfil deve ser Admin ou Recepcionista' }),
    })
    .optional(),
  active: z.boolean().optional(),
}).refine(
  (data) => {
    // Se password estiver vazia, não validar o tamanho mínimo
    if (data.password === '') {
      return true;
    }
    return true;
  },
  {
    message: 'Dados inválidos',
  }
);

// Tipos TypeScript derivados dos schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>; 