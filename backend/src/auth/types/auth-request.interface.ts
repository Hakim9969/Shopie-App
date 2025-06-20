// src/auth/types/auth-request.interface.ts
import { Request } from 'express';
import { Role } from 'generated/prisma';


export interface AuthRequest extends Request {
  user: {
    userId: string; // changed from number to string
    email: string;
    role: Role;
  };
}
