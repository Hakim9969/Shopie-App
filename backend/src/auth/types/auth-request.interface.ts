// src/auth/types/auth-request.interface.ts
import { Request } from 'express';
import { Role } from 'generated/prisma';


export interface AuthRequest extends Request {
  user: {
    userId: number;
    email: string;
    role: Role;
  };
}
