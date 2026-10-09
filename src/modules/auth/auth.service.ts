import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private sanitizeUser<T extends { password: string }>(user: T) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  private createLoginPayload(user: { id: string; role: Role; email: string }) {
    return {
      id: user.id,
      role: user.role,
      email: user.email,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return null;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return null;
    }

    return this.createLoginPayload(user);
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
    });

    const payload = { sub: user.id, role: user.role, email: user.email };

    return {
      user: this.sanitizeUser(user),
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(userOrEmail: { id: string; role: Role; email: string } | string, password?: string) {
    let user: { id: string; role: Role; email: string } | null = null;

    if (typeof userOrEmail === 'string') {
      if (!password) {
        throw new UnauthorizedException('Credenciales incompletas');
      }

      user = await this.validateUser(userOrEmail, password);
    } else {
      user = userOrEmail;
    }

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const payload = { sub: user.id, role: user.role, email: user.email };

    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no existe');
    }

    return this.sanitizeUser(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no existe');
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      throw new UnauthorizedException('La contrasena actual es incorrecta');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Contrasena actualizada correctamente' };
  }
}
