import { timingSafeEqual } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

export const legacyWriteGuard = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.LEGACY_WRITES_ENABLED === 'false' && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return res.status(503).json({ error: 'Mantenimiento: usa la nueva aplicacion.' });
  }
  next();
};

export const requireFlightAdmin = (req: Request, res: Response, next: NextFunction) => {
  const expected = process.env.FLIGHT_ADMIN_TOKEN;
  const supplied = req.headers.authorization?.replace(/^Bearer /, '') ?? '';
  const suppliedBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(expected ?? '');
  if (!expected || expected.length < 32 || suppliedBytes.length !== expectedBytes.length
    || !timingSafeEqual(suppliedBytes, expectedBytes)) {
    return res.status(403).json({ error: 'Operacion restringida.' });
  }
  next();
};
