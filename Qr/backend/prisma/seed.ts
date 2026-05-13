// Seed de base de datos con datos de prueba para el sistema de control de acceso
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Genera una fecha aleatoria dentro de los últimos N días
function randomDateInLastDays(days: number): Date {
  const now = Date.now();
  const past = now - days * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

async function main() {
  console.log('Iniciando seed de base de datos...');

  // Limpiar datos existentes en orden seguro
  await prisma.alert.deleteMany();
  await prisma.accessLog.deleteMany();
  await prisma.person.deleteMany();
  await prisma.door.deleteMany();
  await prisma.user.deleteMany();

  // --- Usuarios del sistema ---
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@empresa.com',
      password_hash: passwordHash,
      rol: 'admin',
    },
  });

  const guardia = await prisma.user.create({
    data: {
      email: 'guardia@empresa.com',
      password_hash: passwordHash,
      rol: 'guardia',
    },
  });

  console.log(`Usuarios creados: ${admin.email}, ${guardia.email}`);

  // --- Puertas de acceso ---
  const doors = await Promise.all([
    prisma.door.create({
      data: { nombre: 'Entrada Principal', ubicacion: 'Planta Baja - Lobby' },
    }),
    prisma.door.create({
      data: { nombre: 'Sala de Servidores', ubicacion: 'Piso 2 - Sector IT' },
    }),
    prisma.door.create({
      data: { nombre: 'Estacionamiento', ubicacion: 'Subsuelo - Acceso Sur', activa: false },
    }),
  ]);

  console.log(`Puertas creadas: ${doors.length}`);

  // --- Personas de prueba ---
  const personasData = [
    { nombre: 'Carlos Mendoza', tipo: 'empleado' },
    { nombre: 'Laura Gutiérrez', tipo: 'empleado' },
    { nombre: 'Martín Rodríguez', tipo: 'empleado' },
    { nombre: 'Sofia Herrera', tipo: 'empleado' },
    { nombre: 'Diego Fernández', tipo: 'empleado' },
    { nombre: 'Ana Torres', tipo: 'visitante' },
    { nombre: 'Roberto Sánchez', tipo: 'visitante' },
    { nombre: 'Claudia Ramírez', tipo: 'contratista' },
    { nombre: 'Pablo Morales', tipo: 'contratista' },
    { nombre: 'Valentina Castro', tipo: 'empleado', activo: false },
  ];

  const persons = await Promise.all(
    personasData.map((p) =>
      prisma.person.create({
        data: {
          nombre: p.nombre,
          tipo: p.tipo,
          qr_token: uuidv4(),
          activo: p.activo !== false,
        },
      })
    )
  );

  console.log(`Personas creadas: ${persons.length}`);

  // --- Registros de acceso (últimos 7 días) ---
  const activeDoor = doors[0];
  const activePersons = persons.filter((p) => p.activo);
  const accessLogs = [];

  for (let i = 0; i < 30; i++) {
    const person = activePersons[i % activePersons.length];
    const tipo = i % 2 === 0 ? 'entrada' : 'salida';
    const timestamp = randomDateInLastDays(7);

    accessLogs.push(
      prisma.accessLog.create({
        data: {
          person_id: person.id,
          door_id: activeDoor.id,
          tipo,
          timestamp,
        },
      })
    );
  }

  await Promise.all(accessLogs);
  console.log(`Registros de acceso creados: ${accessLogs.length}`);

  // --- Alertas de ejemplo ---
  const alertasData = [
    {
      person_id: persons[0].id,
      tipo: 'fuera_horario',
      mensaje: `Acceso fuera de horario laboral detectado para ${persons[0].nombre}`,
    },
    {
      person_id: persons[1].id,
      tipo: 'sin_salida',
      mensaje: `${persons[1].nombre} ingresó sin registrar salida el día anterior`,
    },
    {
      person_id: null,
      tipo: 'qr_invalido',
      mensaje: 'Intento de acceso con código QR no registrado en el sistema',
    },
    {
      person_id: persons[2].id,
      tipo: 'fuera_horario',
      mensaje: `Acceso en fin de semana detectado para ${persons[2].nombre}`,
    },
    {
      person_id: persons[9].id, // persona inactiva
      tipo: 'qr_invalido',
      mensaje: `Intento de acceso con QR de persona inactiva: ${persons[9].nombre}`,
    },
  ];

  await Promise.all(
    alertasData.map((a) =>
      prisma.alert.create({
        data: {
          person_id: a.person_id,
          tipo: a.tipo,
          mensaje: a.mensaje,
        },
      })
    )
  );

  console.log(`Alertas creadas: ${alertasData.length}`);
  console.log('\nSeed completado exitosamente.');
  console.log('\nCredenciales de prueba:');
  console.log('  Admin:   admin@empresa.com   / password123');
  console.log('  Guardia: guardia@empresa.com / password123');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
