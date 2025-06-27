import { z } from 'zod';

export const createSalaSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  descricao: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  recursos: z
    .array(z.string().trim().min(1, 'Recurso não pode estar vazio'))
    .optional()
    .default([]),
  ativa: z.boolean().optional().default(true),
});

export const updateSalaSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  descricao: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .trim()
    .optional()
    .or(z.literal('')),
  recursos: z
    .array(z.string().trim().min(1, 'Recurso não pode estar vazio'))
    .optional(),
  ativa: z.boolean().optional(),
});

export type CreateSalaData = z.infer<typeof createSalaSchema>;
export type UpdateSalaData = z.infer<typeof updateSalaSchema>; 