import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { DestinationsModule } from './modules/destinations/destinations.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TripsModule } from './modules/trips/trips.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { LeadsModule } from './modules/leads/leads.module';
import { RefundsModule } from './modules/refunds/refunds.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    PrismaModule,
    AuthModule,
    BookingsModule,
    DestinationsModule,
    PaymentsModule,
    UsersModule,
    TripsModule,
    LeadsModule,
    RefundsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
