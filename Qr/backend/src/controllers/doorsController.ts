// Controlador de puertas — listado básico para Fase 4 (CRUD completo en Fase 8)
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export async function list(_req: Request, res: Response): Promise<void> {
  try {
    const doors = await prisma.door.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' },
    });
    res.json(doors);
  } catch (error) {
    console.error('Error listando puertas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
