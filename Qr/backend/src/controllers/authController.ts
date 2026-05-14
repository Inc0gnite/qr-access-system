// Controlador de autenticación: login con JWT
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { loginSchema } from '../validators/authValidator';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        message: 'Datos inválidos',
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Credenciales incorrectas' });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      res.status(401).json({ message: 'Credenciales incorrectas' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: 'Configuración del servidor incorrecta' });
      return;
    }

    const signOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
    };
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      secret,
      signOptions,
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, rol: user.rol },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
