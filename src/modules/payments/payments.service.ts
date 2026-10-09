import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [payments, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        include: {
          booking: { select: { bookingCode: true, totalAmount: true } },
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.count(),
    ]);
    return {
      payments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByUser(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: {
        booking: {
          select: {
            bookingCode: true,
            totalAmount: true,
            trip: { select: { title: true, departureDate: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        booking: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    if (!payment) throw new NotFoundException('Pago no encontrado');
    return payment;
  }

  async initiate(userId: string, dto: CreatePaymentDto, role?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { payment: true },
    });

    if (!booking) throw new NotFoundException('Reserva no encontrada');

    // Clientes solo pueden pagar sus propias reservas
    if (role === 'CLIENT' && booking.userId !== userId) {
      throw new ForbiddenException();
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('No se puede pagar una reserva cancelada');
    }

    if (booking.payment) {
      return {
        payment: booking.payment,
        redirectUrl: null,
        message: 'Esta reserva ya tiene un pago asociado.',
      };
    }

    // Si es agente o admin, el pago se asocia al dueño de la reserva
    const payerUserId = (role === 'AGENT' || role === 'ADMIN')
      ? booking.userId
      : userId;

    const payment = await this.prisma.payment.create({
      data: {
        bookingId: dto.bookingId,
        userId: payerUserId,
        amount: booking.totalAmount,
        method: dto.method,
        externalId: dto.externalId,
        externalReference: `CIELO-${booking.bookingCode}`,
        status: (role === 'AGENT' || role === 'ADMIN')
          ? PaymentStatus.APPROVED
          : PaymentStatus.PENDING,
        paidAt: (role === 'AGENT' || role === 'ADMIN') ? new Date() : undefined,
      },
    });

    return {
      payment,
      redirectUrl: null,
      message: 'Pago iniciado. Procede con la plataforma de pago.',
    };
  }

  async processWebhook(externalReference: string, status: string, rawData: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { externalReference },
    });

    if (!payment) throw new NotFoundException('Pago no encontrado');

    const paymentStatus =
      status === 'approved'
        ? PaymentStatus.APPROVED
        : status === 'rejected'
          ? PaymentStatus.REJECTED
          : PaymentStatus.IN_PROCESS;

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        gatewayResponse: rawData,
        ...(paymentStatus === PaymentStatus.APPROVED && { paidAt: new Date() }),
      },
    });

    if (paymentStatus === PaymentStatus.APPROVED) {
      await this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });
    }

    return updated;
  }

  async refund(id: string) {
    const payment = await this.findOne(id);
    if (payment.status !== PaymentStatus.APPROVED) {
      throw new BadRequestException('Solo se pueden reembolsar pagos aprobados');
    }

    return this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.REFUNDED, refundedAt: new Date() },
    });
  }
}
