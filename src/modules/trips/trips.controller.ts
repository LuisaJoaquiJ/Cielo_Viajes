import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { QueryTripDto } from './dto/query-trip.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';
import { Role } from '@prisma/client';

@Controller('trips')
@UseGuards(RolesGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  // Público: ver viajes publicados con filtros
  @Public()
  @Get()
  findAll(@Query() query: QueryTripDto) {
    return this.tripsService.findPublished(query);
  }

  // Público: viajes destacados para el home
  @Public()
  @Get('featured')
  findFeatured() {
    return this.tripsService.findFeatured();
  }

  // Admin: ver todos (incluyendo borradores)
  @Get('admin/all')
  @Roles(Role.ADMIN, Role.AGENT)
  findAllAdmin(@Query() query: QueryTripDto) {
    return this.tripsService.findAll(query);
  }

  // Público: buscar por slug (para SEO)
  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.tripsService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.AGENT)
  create(@Body() dto: CreateTripDto) {
    return this.tripsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.AGENT)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTripDto) {
    return this.tripsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.remove(id);
  }
}
