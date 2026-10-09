import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateLeadDto) {
    return this.prisma.lead.create({ data: dto });
  }

  // ✅ listado admin con paginación
  async adminList(params: { page?: number; limit?: number; status?: string }) {
    const page  = Number(params.page  ?? 1);
    const limit = Number(params.limit ?? 10);
    const skip  = (page - 1) * limit;

    const where = params.status ? { status: params.status } : {};

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      leads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ✅ actualizar estado de un lead
  async updateStatus(id: string, status: string) {
    return this.prisma.lead.update({
      where: { id },
      data:  { status },
    });
  }
}