// Controlador de personas: CRUD completo + generación de QR
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import QRCode from 'qrcode';
import { prisma } from '../lib/prisma';
import { createPersonSchema, updatePersonSchema } from '../validators/personValidator';

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const { search, tipo, activo } = req.query;

    const where: Prisma.PersonWhereInput = {};

    if (search && typeof search === 'string') {
      where.nombre = { contains: search, mode: 'insensitive' };
    }
    if (tipo && typeof tipo === 'string') {
      where.tipo = tipo;
    }
    if (activo !== undefined && typeof activo === 'string') {
      where.activo = activo === 'true';
    }

    const persons = await prisma.person.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    res.json(persons);
  } catch (error) {
    console.error('Error listando personas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const person = await prisma.person.findUnique({ where: { id } });
    if (!person) {
      res.status(404).json({ message: 'Persona no encontrada' });
      return;
    }
    res.json(person);
  } catch (error) {
    console.error('Error obteniendo persona:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const result = createPersonSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        message: 'Datos inválidos',
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const person = await prisma.person.create({
      data: {
        nombre: result.data.nombre,
        tipo: result.data.tipo,
        foto_url: result.data.foto_url ?? null,
        // qr_token se genera automáticamente via @default(uuid()) en Prisma
      },
    });

    res.status(201).json(person);
  } catch (error) {
    console.error('Error creando persona:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const result = updatePersonSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        message: 'Datos inválidos',
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const person = await prisma.person.findUnique({ where: { id } });
    if (!person) {
      res.status(404).json({ message: 'Persona no encontrada' });
      return;
    }

    const updated = await prisma.person.update({
      where: { id },
      data: result.data,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error actualizando persona:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// Soft delete: desactiva la persona preservando el historial de accesos
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const person = await prisma.person.findUnique({ where: { id } });
    if (!person) {
      res.status(404).json({ message: 'Persona no encontrada' });
      return;
    }

    await prisma.person.update({ where: { id }, data: { activo: false } });
    res.json({ message: 'Persona desactivada correctamente' });
  } catch (error) {
    console.error('Error eliminando persona:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function getQr(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const person = await prisma.person.findUnique({ where: { id } });
    if (!person) {
      res.status(404).json({ message: 'Persona no encontrada' });
      return;
    }

    const buffer = await QRCode.toBuffer(person.qr_token, { width: 300, margin: 2 });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="qr-${person.nombre.replace(/\s+/g, '-')}.png"`,
    );
    res.send(buffer);
  } catch (error) {
    console.error('Error generando QR:', error);
    res.status(500).json({ message: 'Error generando código QR' });
  }
}
