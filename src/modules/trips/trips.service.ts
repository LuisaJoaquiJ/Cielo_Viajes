import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TripStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { QueryTripDto } from './dto/query-trip.dto';

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-') +
    '-' +
    Date.now()
  );
}

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(query: QueryTripDto) {
    const {
      page = 1,
      limit = 10,
      search,
      destinationId,
      departureCity,
      status,
      isFeatured,
      departureDateFrom,
      departureDateTo,
      priceMin,
      priceMax,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { departureCity: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(destinationId && { destinationId }),
      ...(departureCity && {
        departureCity: { contains: departureCity, mode: 'insensitive' },
      }),
      ...(status && { status }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(departureDateFrom || departureDateTo
        ? {
          departureDate: {
            ...(departureDateFrom && { gte: new Date(departureDateFrom) }),
            ...(departureDateTo && { lte: new Date(departureDateTo) }),
          },
        }
        : {}),
      ...(priceMin !== undefined || priceMax !== undefined
        ? {
          price: {
            ...(priceMin !== undefined && { gte: priceMin }),
            ...(priceMax !== undefined && { lte: priceMax }),
          },
        }
        : {}),
    };

    const [trips, total] = await this.prisma.$transaction([
      this.prisma.trip.findMany({
        where,
        include: {
          destination: { select: { id: true, name: true, country: true, city: true, coverImage: true } },
          _count: { select: { bookings: true, reviews: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return {
      trips: trips.map((t) => ({
        ...t,
        availableSeats: t.capacity - t.bookedSeats,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findPublished(query: QueryTripDto) {
    return this.findAll({ ...query, status: TripStatus.PUBLISHED });
  }

  async findFeatured() {
    const trips = await this.prisma.trip.findMany({
      where: { isFeatured: true, status: TripStatus.PUBLISHED, deletedAt: null },
      include: {
        destination: { select: { name: true, country: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    return trips.map((t) => ({ ...t, availableSeats: t.capacity - t.bookedSeats }));
  }

  async findOne(id: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id, deletedAt: null },
      include: {
        destination: true,
        itinerary: { orderBy: { day: 'asc' } },
        reviews: {
          where: { isPublished: true },
          include: {
            user: { select: { firstName: true, lastName: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { bookings: true, reviews: true } },
      },
    });

    if (!trip) throw new NotFoundException('Viaje no encontrado');

    return {
      ...trip,
      availableSeats: trip.capacity - trip.bookedSeats,
    };
  }

  async findBySlug(slug: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { slug, deletedAt: null },
      include: {
        destination: true,
        itinerary: { orderBy: { day: 'asc' } },
        reviews: {
          where: { isPublished: true },
          include: {
            user: { select: { firstName: true, lastName: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!trip) throw new NotFoundException('Viaje no encontrado');
    return { ...trip, availableSeats: trip.capacity - trip.bookedSeats };
  }

  async create(dto: CreateTripDto) {
    const { itinerary, ...tripData } = dto;

    const departure = new Date(tripData.departureDate);
    const returnDate = new Date(tripData.returnDate);

    if (returnDate <= departure) {
      throw new BadRequestException(
        'La fecha de regreso debe ser posterior a la de salida',
      );
    }

    const durationDays = Math.ceil(
      (returnDate.getTime() - departure.getTime()) / (1000 * 60 * 60 * 24),
    );

    const slug = generateSlug(tripData.title);

    const trip = await this.prisma.trip.create({
      data: {
        ...tripData,

        // 🔥 AQUÍ ESTÁ LA FIX
        departureDate: departure,
        returnDate: returnDate,

        slug,
        durationDays,

        ...(itinerary && {
          itinerary: { create: itinerary },
        }),
      },
      include: {
        destination: { select: { name: true, country: true } },
        itinerary: { orderBy: { day: 'asc' } },
      },
    });

    return trip;
  }

  async update(id: string, dto: UpdateTripDto) {
    await this.findOne(id);
    const { itinerary, ...tripData } = dto;

    let durationDays: number | undefined;
    if (tripData.departureDate && tripData.returnDate) {
      const d = new Date(tripData.departureDate);
      const r = new Date(tripData.returnDate);
      durationDays = Math.ceil((r.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    }

    return this.prisma.trip.update({
      where: { id },
      data: {
        ...tripData,
        ...(durationDays !== undefined && { durationDays }),
      },
      include: { destination: true, itinerary: { orderBy: { day: 'asc' } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.trip.update({
      where: { id },
      data: { deletedAt: new Date(), status: TripStatus.CANCELLED },
    });
    return { message: 'Viaje eliminado correctamente' };
  }
}
