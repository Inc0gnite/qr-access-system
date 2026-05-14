// Controlador de reportes: asistencia por persona y exportación a Excel
import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

// ─── Validación ───────────────────────────────────────────────────────────────

const dateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
});

// ─── Helper compartido ────────────────────────────────────────────────────────

async function getAttendanceData(from: string, to: string) {
  // Incluye el día completo de 'to' usando el inicio del día siguiente
  const fromDate = new Date(`${from}T00:00:00.000Z`);
  const toDate = new Date(`${to}T23:59:59.999Z`);

  const persons = await prisma.person.findMany({
    where: { activo: true },
    include: {
      accesos: {
        where: {
          timestamp: { gte: fromDate, lte: toDate },
        },
        orderBy: { timestamp: 'asc' },
        include: { door: { select: { id: true, nombre: true } } },
      },
    },
    orderBy: { nombre: 'asc' },
  });

  return persons.map((person) => {
    const logs = person.accesos;

    // Emparejar entradas con la siguiente salida para calcular duración
    let totalMinutes = 0;
    let sessions = 0;
    const daysSet = new Set<string>();

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const dateKey = log.timestamp.toISOString().slice(0, 10);
      daysSet.add(dateKey);

      if (log.tipo === 'entrada') {
        sessions++;
        // Buscar la salida más cercana después de esta entrada
        const exit = logs.slice(i + 1).find((l: typeof logs[0]) => l.tipo === 'salida');
        if (exit) {
          const diff = (exit.timestamp.getTime() - log.timestamp.getTime()) / 60000;
          totalMinutes += Math.round(diff);
        }
      }
    }

    return {
      person: {
        id: person.id,
        nombre: person.nombre,
        tipo: person.tipo,
      },
      sessions,
      total_minutes: totalMinutes,
      days: daysSet.size,
    };
  });
}

// ─── GET /api/reports/attendance?from=&to= ────────────────────────────────────

export async function attendance(req: Request, res: Response): Promise<void> {
  const parsed = dateRangeSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: 'Parámetros inválidos', errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const data = await getAttendanceData(parsed.data.from, parsed.data.to);
    res.json(data);
  } catch (err) {
    console.error('Error al obtener asistencia:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

// ─── GET /api/reports/export?from=&to= ───────────────────────────────────────

export async function exportReport(req: Request, res: Response): Promise<void> {
  const parsed = dateRangeSchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: 'Parámetros inválidos', errors: parsed.error.flatten().fieldErrors });
    return;
  }

  try {
    const data = await getAttendanceData(parsed.data.from, parsed.data.to);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'QR Access Control';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Asistencia');

    // Columnas
    sheet.columns = [
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Tipo', key: 'tipo', width: 16 },
      { header: 'Días presentes', key: 'days', width: 16 },
      { header: 'Sesiones', key: 'sessions', width: 14 },
      { header: 'Total horas', key: 'hours', width: 14 },
      { header: 'Total minutos', key: 'minutes', width: 16 },
    ];

    // Fila de encabezado con estilos
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF8B5CF6' }, // accent
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    headerRow.height = 22;

    // Filas de datos
    data.forEach((record) => {
      sheet.addRow({
        nombre: record.person.nombre,
        tipo: record.person.tipo,
        days: record.days,
        sessions: record.sessions,
        hours: +(record.total_minutes / 60).toFixed(2),
        minutes: record.total_minutes,
      });
    });

    // Estilo para filas de datos (bordes sutiles)
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell((cell) => {
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
        cell.alignment = { vertical: 'middle' };
      });
    });

    // Fila de metadatos al final
    sheet.addRow([]);
    sheet.addRow([`Período: ${parsed.data.from} — ${parsed.data.to}`]);
    sheet.addRow([`Generado: ${new Date().toLocaleString('es')}`]);

    // Escribir a buffer y enviar
    const buffer = await workbook.xlsx.writeBuffer();

    const filename = `asistencia_${parsed.data.from}_${parsed.data.to}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Error al exportar reporte:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
