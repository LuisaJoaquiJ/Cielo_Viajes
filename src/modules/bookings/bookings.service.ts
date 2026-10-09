import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { BookingStatus, PassengerType, Role, TripStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

const BOOKING_INCLUDE = {
  trip: {
    include: {
      destination: { select: { name: true, country: true, city: true } },
    },
  },
  passengers: true,
  payment: true,
  user: { select: { id: true, firstName: true, lastName: true, email: true } },
};

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, status?: BookingStatus) {
    const skip = (page - 1) * limit;
    const where = {
      ...(status && { status }),
    };

    const [bookings, total] = await this.prisma.$transaction([
      this.prisma.booking.findMany({
        where,
        include: BOOKING_INCLUDE,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByUser(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: BOOKING_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: BOOKING_INCLUDE,
    });
    if (!booking) throw new NotFoundException('Reserva no encontrada');
    return booking;
  }

  async create(userId: string, userRole: Role, dto: CreateBookingDto) {
  // Si es agente/admin y manda clientUserId, la reserva va a nombre del cliente
  const finalUserId =
    (userRole === Role.AGENT || userRole === Role.ADMIN) && dto.clientUserId
      ? dto.clientUserId
      : userId;

  // Verificar que el cliente existe si se especificó
  if (dto.clientUserId) {
    const client = await this.prisma.user.findUnique({ where: { id: dto.clientUserId } });
    if (!client) throw new NotFoundException('Cliente no encontrado');
  }

  const trip = await this.prisma.trip.findFirst({
    where: { id: dto.tripId, deletedAt: null },
  });

  if (!trip) throw new NotFoundException('Viaje no encontrado');
  if (trip.status !== TripStatus.PUBLISHED) {
    throw new BadRequestException('Este viaje no está disponible');
  }

  const availableSeats = trip.capacity - trip.bookedSeats;
  if (dto.passengers.length > availableSeats) {
    throw new BadRequestException(`Solo quedan ${availableSeats} cupos disponibles`);
  }

  const adults = dto.passengers.filter(
    (p) => p.type === PassengerType.ADULT || p.type === PassengerType.INFANT,
  );
  const children = dto.passengers.filter((p) => p.type === PassengerType.CHILD);

  const totalAmount =
    adults.length * Number(trip.price) +
    children.length * Number(trip.priceChild ?? trip.price);

  const booking = await this.prisma.booking.create({
    data: {
      userId: finalUserId,
      tripId: dto.tripId,
      totalAmount,
      specialRequests: dto.specialRequests,
      passengers: {
        create: dto.passengers.map((p) => ({
          ...p,
          birthDate: new Date(p.birthDate),
        })),
      },
    },
    include: BOOKING_INCLUDE,
  });

  return booking;
}
  async update(
    id: string,
    dto: UpdateBookingDto,
    userId: string,
    userRole: Role,
  ) {
    const booking = await this.findOne(id);

    if (userRole === Role.CLIENT && booking.userId !== userId) {
      throw new ForbiddenException('No puedes modificar esta reserva');
    }

    const data: any = { ...dto };

    if (dto.status === BookingStatus.CONFIRMED) {
      data.confirmedAt = new Date();
      // Actualizar cupos del viaje
      await this.prisma.trip.update({
        where: { id: booking.tripId },
        data: { bookedSeats: { increment: booking.passengers.length } },
      });
    }

    if (dto.status === BookingStatus.CANCELLED) {
      data.cancelledAt = new Date();
      // Liberar cupos si estaba confirmada
      if (booking.status === BookingStatus.CONFIRMED) {
        await this.prisma.trip.update({
          where: { id: booking.tripId },
          data: { bookedSeats: { decrement: booking.passengers.length } },
        });
      }
    }

    return this.prisma.booking.update({
      where: { id },
      data,
      include: BOOKING_INCLUDE,
    });
  }

  async cancel(id: string, userId: string, reason?: string) {
    const booking = await this.findOne(id);

    if (booking.userId !== userId) {
      throw new ForbiddenException('No puedes cancelar esta reserva');
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `No se puede cancelar una reserva en estado ${booking.status}`,
      );
    }

    return this.update(
      id,
      { status: BookingStatus.CANCELLED, cancellationReason: reason },
      userId,
      Role.CLIENT,
    );
  }
}
