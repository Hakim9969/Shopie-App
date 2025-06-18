import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'generated/prisma';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
    constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

     const { name, email } = registerDto;
     
    const user = await this.userService.createUser({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: Role.CUSTOMER,
    });

    return this.signToken(user.id, user.email, user.role);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user.id, user.email, user.role);
  }

  private signToken(userId: number, email: string, role: Role) {
    const payload = { sub: userId, email, role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
