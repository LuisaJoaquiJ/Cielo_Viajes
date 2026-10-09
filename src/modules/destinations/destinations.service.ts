import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';

function generateSlug(name: string, city: string, country: string): string {
  const base = `${name}-${city}-${country}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${base}-${Date.now()}`;
}

@Injectable()
export class DestinationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { country: { contains: search, mode: 'insensitive' as const } },
          { city: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [destinations, total] = await this.prisma.$transaction([
      this.prisma.destination.findMany({
        where,
        include: { _count: { select: { trips: true, reviews: true } } },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.destination.count({ where }),
    ]);

    return {
      destinations,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const dest = await this.prisma.destination.findUnique({
      where: { id },
      include: {
        trips: {
          where: { status: 'PUBLISHED', deletedAt: null },
          select: {
            id: true, title: true, coverImage: true, price: true,
            departureDate: true, durationDays: true, bookedSeats: true, capacity: true,
          },
          orderBy: { departureDate: 'asc' },
        },
        reviews: {
          where: { isPublished: true },
          include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
          take: 5,
        },
      },
    });
    if (!dest) throw new NotFoundException('Destino no encontrado');
    return dest;
  }

  async findBySlug(slug: string) {
    const dest = await this.prisma.destination.findUnique({
      where: { slug },
      include: {
        trips: {
          where: { status: 'PUBLISHED', deletedAt: null },
          select: {
            id: true, title: true, slug: true, coverImage: true, price: true,
            departureDate: true, durationDays: true, bookedSeats: true, capacity: true,
          },
        },
        reviews: {
          where: { isPublished: true },
          include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
          take: 5,
        },
      },
    });
    if (!dest) throw new NotFoundException('Destino no encontrado');
    return dest;
  }

  async create(dto: CreateDestinationDto) {
    const slug = generateSlug(dto.name, dto.city, dto.country);
    return this.prisma.destination.create({
      data: { ...dto, slug },
    });
  }

  async update(id: string, dto: UpdateDestinationDto) {
    await this.findOne(id);
    return this.prisma.destination.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.destination.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Destino desactivado correctamente' };
  }
}
