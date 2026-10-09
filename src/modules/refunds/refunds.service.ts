import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateRefundDto } from './dto/create-refund.dto'
import { UpdateRefundDto } from './dto/update-refund.dto'
import { RefundStatus, RefundFileType } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const REFUND_INCLUDE = {
  segments: true,
  files: true,
  history: { orderBy: { createdAt: 'desc' as const } },
}

@Injectable()
export class RefundsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    page?: number; limit?: number; search?: string
    status?: RefundStatus; airline?: string
  }) {
    const page  = params.page  ?? 1
    const limit = params.limit ?? 15
    const skip  = (page - 1) * limit

    const where: any = {
      ...(params.status  && { status: params.status }),
      ...(params.airline && { airline: { contains: params.airline, mode: 'insensitive' } }),
      ...(params.search  && {
        OR: [
          { passengerName: { contains: params.search, mode: 'insensitive' } },
          { pnr:           { contains: params.search, mode: 'insensitive' } },
          { caseNumber:    { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    }

    const [refunds, total] = await Promise.all([
      this.prisma.refund.findMany({
        where, skip, take: limit,
        include: { segments: true, files: true, history: false },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.refund.count({ where }),
    ])

    return { refunds, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async findOne(id: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id }, include: REFUND_INCLUDE,
    })
    if (!refund) throw new NotFoundException('Caso no encontrado')
    return refund
  }

  async create(dto: CreateRefundDto) {
    const refund = await this.prisma.refund.create({
      data: {
        passengerName:  dto.passengerName,
        pnr:            dto.pnr,
        caseNumber:     dto.caseNumber,
        airline:        dto.airline,
        status:         dto.status ?? RefundStatus.PENDING,
        customerPaid:   dto.customerPaid,
        refundReceived: dto.refundReceived ?? 0,
        refundDate:     dto.refundDate ? new Date(dto.refundDate) : null,
        notes:          dto.notes,
        segments: {
          create: dto.segments.map(s => ({
            origin:            s.origin,
            destination:       s.destination,
            departureDate:     new Date(s.departureDate),
            ticketPrice:       s.ticketPrice,
            refundOptionPrice: s.refundOptionPrice,
          })),
        },
        history: {
          create: { action: 'CREATED', description: 'Caso de reembolso creado' },
        },
      },
      include: REFUND_INCLUDE,
    })
    return refund
  }

  async update(id: string, dto: UpdateRefundDto) {
    const refund = await this.findOne(id)
    const updated = await this.prisma.refund.update({
      where: { id },
      data: {
        ...dto,
        refundDate: dto.refundDate ? new Date(dto.refundDate) : undefined,
      },
      include: REFUND_INCLUDE,
    })

    // Registrar en historial si cambió el estado
    if (dto.status && dto.status !== refund.status) {
      await this.prisma.refundHistory.create({
        data: {
          refundId:    id,
          action:      'STATUS_CHANGED',
          description: `Estado cambiado de ${refund.status} a ${dto.status}`,
        },
      })
    }

    if (dto.refundReceived !== undefined) {
      await this.prisma.refundHistory.create({
        data: {
          refundId:    id,
          action:      'REFUND_UPDATED',
          description: `Reembolso recibido actualizado a $${dto.refundReceived}`,
        },
      })
    }

    return updated
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.refund.delete({ where: { id } })
    return { message: 'Caso eliminado correctamente' }
  }

  // ── Segmentos ──────────────────────────────────────────
  async addSegment(refundId: string, dto: any) {
    await this.findOne(refundId)
    const segment = await this.prisma.refundSegment.create({
      data: {
        refundId,
        origin:            dto.origin,
        destination:       dto.destination,
        departureDate:     new Date(dto.departureDate),
        ticketPrice:       dto.ticketPrice,
        refundOptionPrice: dto.refundOptionPrice ?? 0,
      },
    })
    await this.prisma.refundHistory.create({
      data: {
        refundId,
        action:      'SEGMENT_ADDED',
        description: `Trayecto ${dto.origin} → ${dto.destination} agregado`,
      },
    })
    return segment
  }

  async removeSegment(refundId: string, segmentId: string) {
    await this.prisma.refundSegment.delete({ where: { id: segmentId } })
    await this.prisma.refundHistory.create({
      data: { refundId, action: 'SEGMENT_REMOVED', description: 'Trayecto eliminado' },
    })
    return { message: 'Trayecto eliminado' }
  }

  // ── Archivos ───────────────────────────────────────────
  async addFile(refundId: string, file: Express.Multer.File, fileType: RefundFileType) {
    await this.findOne(refundId)
    const refundFile = await this.prisma.refundFile.create({
      data: {
        refundId,
        fileName: file.originalname,
        filePath: file.path,
        fileType: fileType ?? RefundFileType.OTRO,
      },
    })
    await this.prisma.refundHistory.create({
      data: {
        refundId,
        action:      'FILE_UPLOADED',
        description: `Archivo "${file.originalname}" subido`,
      },
    })
    return refundFile
  }

  async removeFile(refundId: string, fileId: string) {
    const file = await this.prisma.refundFile.findUnique({ where: { id: fileId } })
    if (!file) throw new NotFoundException('Archivo no encontrado')
    if (fs.existsSync(file.filePath)) fs.unlinkSync(file.filePath)
    await this.prisma.refundFile.delete({ where: { id: fileId } })
    await this.prisma.refundHistory.create({
      data: { refundId, action: 'FILE_REMOVED', description: `Archivo "${file.fileName}" eliminado` },
    })
    return { message: 'Archivo eliminado' }
  }

  // ── Dashboard stats ────────────────────────────────────
  async getStats() {
    const [all, byStatus] = await Promise.all([
      this.prisma.refund.findMany({ include: { segments: true } }),
      this.prisma.refund.groupBy({ by: ['status'], _count: true }),
    ])

    const totalRefunded   = all.reduce((acc, r) => acc + Number(r.refundReceived), 0)
    const totalCustomer   = all.reduce((acc, r) => acc + Number(r.customerPaid), 0)
    const totalTickets    = all.reduce((acc, r) =>
      acc + r.segments.reduce((s, seg) =>
        s + Number(seg.ticketPrice) + Number(seg.refundOptionPrice), 0), 0)
    const totalAgency     = totalTickets - totalCustomer
    const totalResult     = totalRefunded - totalAgency

    const statusMap = Object.fromEntries(byStatus.map(s => [s.status, s._count]))

    return {
      totalCases:    all.length,
      totalRefunded,
      totalResult,
      pending:       statusMap['PENDING']   ?? 0,
      inReview:      statusMap['IN_REVIEW'] ?? 0,
      sent:          statusMap['SENT']      ?? 0,
      refunded:      statusMap['REFUNDED']  ?? 0,
      rejected:      statusMap['REJECTED']  ?? 0,
    }
  }
}