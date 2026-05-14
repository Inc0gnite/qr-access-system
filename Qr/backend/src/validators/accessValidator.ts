// Validaciones Zod para el escáner de accesos
import { z } from 'zod';

export const scanSchema = z.object({
  qr_token: z.string().uuid('Token QR inválido'),
  door_id: z.string().uuid('ID de puerta inválido'),
});

export type ScanInput = z.infer<typeof scanSchema>;
