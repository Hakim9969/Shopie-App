import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'generated/prisma';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { addMinutes } from 'date-fns';
import { MailService } from 'src/mail/mail.service';
@Injectable()
export class AuthService {
    constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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

  private signToken(userId: string, email: string, role: Role) {
    const payload = { sub: userId, email, role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // 📩 Forgot password - send reset link
async forgotPassword(dto: ForgotPasswordDto) {
  const user = await this.userService.findByEmail(dto.email);
  if (!user) return { message: 'If the email exists, a reset link has been sent' };

  const token = randomBytes(32).toString('hex');
  const expiry = addMinutes(new Date(), 15);

  await this.userService.updateUser(user.id, {
    resetToken: token,
    resetTokenExpiry: expiry,
  });

  await this.mailService.sendEmail({
  to: user.email,
  subject: 'Your Password Reset Token',
  template: 'reset-token',
  context: {
    name: user.name,
    token,
  },
});

    return { message: 'If the email exists, a reset link has been sent' };
}

// 🔒 Reset password
async resetPassword(dto: ResetPasswordDto) {
  const user = await this.userService.findByResetToken(dto.token);
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    throw new BadRequestException('Invalid or expired token');
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  await this.userService.updateUser(user.id, {
    password: hashedPassword,
    resetToken: null,
    resetTokenExpiry: null,
  });

  return { message: 'Password has been reset successfully' };
}
}
