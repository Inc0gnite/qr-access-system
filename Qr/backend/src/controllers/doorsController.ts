// Controlador de puertas — CRUD completo
import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

// ─── Validación ───────────────────────────────────────────────────────────────

const doorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  ubicacion: z.string().min(1, 'La ubicación es requerida').max(200),
});

// ─── GET /api/doors — puertas activas (usado por el scanner y guardias) ───────

export async function list(_req: Request, res: Response): Promise<void> {
  try {
    const doors = await prisma.door.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' },
    });
    res.json(doors);
  } catch (err) {
    console.error('Error listando puertas:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// ─── GET /api/doors/all — todas las puertas (admin) ──────────────────────────

export async function listAll(_req: Request, res: Response): Promise<void> {
  try {
    const doors = await prisma.door.findMany({
      orderBy: { nombre: 'asc' },
    });
    res.json(doors);
  } catch (err) {
    console.error('Error listando puertas:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// ─── POST /api/doors ──────────────────────────────────────────────────────────

export async function create(req: Request, res: Response): Promise<void> {
  const parsed = doorSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const door = await prisma.door.create({ data: parsed.data });
    res.status(201).json(door);
  } catch (err) {
    console.error('Error creando puerta:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// ─── PUT /api/doors/:id ───────────────────────────────────────────────────────

export async function update(req: Request, res: Response): Promise<void> {
  const parsed = doorSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Datos inválidos', errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const door = await prisma.door.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(door);
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === 'P2025') {
      res.status(404).json({ message: 'Puerta no encontrada' });
      return;
    }
    console.error('Error actualizando puerta:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// ─── PATCH /api/doors/:id/toggle — activa/desactiva ──────────────────────────

export async function toggle(req: Request, res: Response): Promise<void> {
  try {
    const door = await prisma.door.findUnique({ where: { id: req.params.id } });
    if (!door) {
      res.status(404).json({ message: 'Puerta no encontrada' });
      return;
    }

    const updated = await prisma.door.update({
      where: { id: req.params.id },
      data: { activa: !door.activa },
    });
    res.json(updated);
  } catch (err) {
    console.error('Error toggling puerta:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// ─── DELETE /api/doors/:id ────────────────────────────────────────────────────

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const logsCount = await prisma.accessLog.count({ where: { door_id: req.params.id } });
    if (logsCount > 0) {
      res.status(409).json({
        message: `No se puede eliminar: la puerta tiene ${logsCount} registros de acceso asociados. Desactívela en su lugar.`,
      });
      return;
    }

    await prisma.door.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === 'P2025') {
      res.status(404).json({ message: 'Puerta no encontrada' });
      return;
    }
    console.error('Error eliminando puerta:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
