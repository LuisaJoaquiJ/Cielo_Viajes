import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, Prisma } from '@prisma/client'; // ✅ quitar PrismaClient, no se usa

const USER_SELECT = {
  id: true, email: true, firstName: true, lastName: true,
  phone: true, avatar: true, role: true, isActive: true,
  emailVerified: true, createdAt: true, updatedAt: true,
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ search agregado como parámetro
  async findAll(page = 1, limit = 10, role?: Role, search?: string) {
    const skip = (page - 1) * limit
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(role && { role }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { lastName:  { contains: search, mode: Prisma.QueryMode.insensitive } },
          { email:     { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      }),
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ where, select: USER_SELECT, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where }),
    ])

    return { users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null }, select: USER_SELECT })
    if (!user) throw new NotFoundException('Usuario no encontrado')
    return user
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('El email ya está registrado')
    const hashed = await bcrypt.hash(dto.password, 10)
    return this.prisma.user.create({ data: { ...dto, password: hashed }, select: USER_SELECT })
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id)
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10)
    return this.prisma.user.update({ where: { id }, data: dto, select: USER_SELECT })
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } })
    return { message: 'Usuario eliminado correctamente' }
  }

  async getMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        trip: { select: { id: true, title: true, coverImage: true, departureDate: true, returnDate: true, destination: { select: { name: true, country: true } } } },
        payment: { select: { status: true, amount: true, method: true } },
        passengers: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}