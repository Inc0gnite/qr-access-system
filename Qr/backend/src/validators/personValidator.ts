// Validaciones Zod para personas
import { z } from 'zod';

export const createPersonSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  tipo: z.enum(['empleado', 'visitante', 'contratista'], {
    errorMap: () => ({ message: 'Tipo debe ser empleado, visitante o contratista' }),
  }),
  foto_url: z.string().url('URL de foto inválida').nullable().optional(),
});

export const updatePersonSchema = createPersonSchema.partial().extend({
  activo: z.boolean().optional(),
});

export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>;
