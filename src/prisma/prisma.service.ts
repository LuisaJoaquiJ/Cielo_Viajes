import 'dotenv/config';
import { INestApplication, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const { PrismaClient } = require('@prisma/client');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  private static createAdapter() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL no esta definida. Configura tu conexion a PostgreSQL en el archivo .env.');
    }

    const pool = new Pool({ connectionString });
    return new PrismaPg(pool);
  }

  constructor() {
    super({
      adapter: PrismaService.createAdapter(),
    });
  }

  async onModuleInit() {
    await this.$connect();
    const result = (await this.$queryRawUnsafe('select current_database() as db')) as Array<{ db: string }>;
    const database = result[0]?.db ?? 'desconocida';
    this.logger.log(`Conexion Prisma lista sobre PostgreSQL. Base activa: ${database}`);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    const shutdown = async () => {
      await app.close();
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  }
}
