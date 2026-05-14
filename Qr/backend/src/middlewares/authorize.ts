// Middleware de autorización por rol — usar siempre después de authenticate
import { Request, Response, NextFunction } from 'express';

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    if (!roles.includes(req.user.rol)) {
      res.status(403).json({ message: 'Acceso denegado: permisos insuficientes' });
      return;
    }
    next();
  };
}
