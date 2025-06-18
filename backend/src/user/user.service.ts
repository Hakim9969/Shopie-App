import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

  // Create a new user
  async createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  // Get user by email
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // Get user by ID
  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
