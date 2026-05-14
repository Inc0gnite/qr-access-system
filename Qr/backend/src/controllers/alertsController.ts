// Controlador de alertas: listado y marcado como leída
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export async function listAlerts(req: Request, res: Response): Promise<void> {
  try {
    const { leida } = req.query;

    const where: Prisma.AlertWhereInput = {};
    if (leida !== undefined && typeof leida === 'string') {
      where.leida = leida === 'true';
    }

    const alerts = await prisma.alert.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        person: { select: { id: true, nombre: true } },
      },
    });

    res.json(alerts);
  } catch (error) {
    console.error('Error listando alertas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.findUnique({ where: { id } });
    if (!alert) {
      res.status(404).json({ message: 'Alerta no encontrada' });
      return;
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: { leida: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error marcando alerta como leída:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function markAllAsRead(_req: Request, res: Response): Promise<void> {
  try {
    const { count } = await prisma.alert.updateMany({
      where: { leida: false },
      data: { leida: true },
    });
    res.json({ message: `${count} alertas marcadas como leídas` });
  } catch (error) {
    console.error('Error marcando alertas como leídas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
