import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    const result = (await this.prisma.$queryRawUnsafe(
      'select current_database() as db, now() as server_time',
    )) as Array<{ db: string; server_time: Date }>;

    return {
      ok: true,
      database: result[0]?.db ?? 'desconocida',
      serverTime: result[0]?.server_time ?? null,
    };
  }
}
