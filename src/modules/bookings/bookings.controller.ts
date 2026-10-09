import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';
import { BookingStatus, Role } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // ajusta el path

class CancelBookingDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard) // ← los dos a nivel de clase, en ese orden
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Get()
  @Roles(Role.ADMIN, Role.AGENT)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: BookingStatus,
  ) {
    return this.bookingsService.findAll(page, limit, status);
  }

  @Get('my')
  findMyBookings(@CurrentUser('id') userId: string) {
    return this.bookingsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.AGENT, Role.CLIENT) // sin @UseGuards extra
  create(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.create(userId, role, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.AGENT, Role.CLIENT)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.bookingsService.update(id, dto, userId, role);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CancelBookingDto,
  ) {
    return this.bookingsService.cancel(id, userId, dto.reason);
  }
}