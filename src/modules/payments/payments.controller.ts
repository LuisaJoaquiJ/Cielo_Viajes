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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, WebhookPaymentDto } from './dto/create-payment.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ParseUUIDPipe } from '../../common/pipes/parse-uuid.pipe';
import { Role } from '@prisma/client';

@Controller('payments')
@UseGuards(RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Get()
  @Roles(Role.ADMIN, Role.AGENT)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.paymentsService.findAll(page, limit);
  }

  @Get('my')
  findMyPayments(@CurrentUser('id') userId: string) {
    return this.paymentsService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.findOne(id);
  }

  // Iniciar proceso de pago
  @Post('initiate')
  @Roles(Role.CLIENT, Role.AGENT, Role.ADMIN)
  initiate(
    @CurrentUser() user: any,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.initiate(user.id, dto, user.role);
  }

  // Webhook de MercadoPago (público, sin auth)
  @Public()
  @Post('webhook')
  webhook(@Body() body: WebhookPaymentDto) {
    return this.paymentsService.processWebhook(
      body.externalReference,
      body.status,
      body,
    );
  }

  // Admin: reembolsar
  @Patch(':id/refund')
  @Roles(Role.ADMIN)
  refund(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentsService.refund(id);
  }
}
