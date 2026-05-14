// Controlador de accesos: escaneo de QR y registro de entrada/salida
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { scanSchema } from '../validators/accessValidator';

export async function scan(req: Request, res: Response): Promise<void> {
  try {
    const result = scanSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        message: 'Datos inválidos',
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const { qr_token, door_id } = result.data;

    // Verificar que la puerta existe y está activa
    const door = await prisma.door.findUnique({ where: { id: door_id } });
    if (!door || !door.activa) {
      res.status(404).json({ success: false, message: 'Puerta no encontrada o inactiva' });
      return;
    }

    // Buscar persona por qr_token
    const person = await prisma.person.findUnique({ where: { qr_token } });

    if (!person) {
      await prisma.alert.create({
        data: {
          tipo: 'qr_invalido',
          mensaje: `QR no registrado intentó acceder en ${door.nombre}`,
        },
      });
      res.status(404).json({ success: false, message: 'Código QR no registrado' });
      return;
    }

    if (!person.activo) {
      await prisma.alert.create({
        data: {
          person_id: person.id,
          tipo: 'qr_invalido',
          mensaje: `Persona inactiva intentó acceder: ${person.nombre} en ${door.nombre}`,
        },
      });
      res.status(403).json({ success: false, message: 'Persona inactiva — acceso denegado' });
      return;
    }

    // Determinar tipo de acceso alternando según el último registro
    const lastAccess = await prisma.accessLog.findFirst({
      where: { person_id: person.id },
      orderBy: { timestamp: 'desc' },
    });

    const tipo = !lastAccess || lastAccess.tipo === 'salida' ? 'entrada' : 'salida';

    const accessLog = await prisma.accessLog.create({
      data: { person_id: person.id, door_id, tipo },
    });

    res.json({
      success: true,
      tipo,
      person: {
        id: person.id,
        nombre: person.nombre,
        tipo: person.tipo,
        foto_url: person.foto_url,
      },
      door: { id: door.id, nombre: door.nombre },
      timestamp: accessLog.timestamp,
    });
  } catch (error) {
    console.error('Error en escaneo:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
