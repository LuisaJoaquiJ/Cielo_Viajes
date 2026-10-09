import { PaymentMethod } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  bookingId!: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsString()
  externalId?: string;
}

export class WebhookPaymentDto {
  @IsString()
  externalReference!: string;

  @IsString()
  status!: string;
}
