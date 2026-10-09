import { IsString, IsOptional, IsEnum, IsNumber, Min, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'
import { RefundStatus } from '@prisma/client'

export class UpdateRefundDto {
  @IsOptional() @IsString() passengerName?: string
  @IsOptional() @IsString() pnr?: string
  @IsOptional() @IsString() caseNumber?: string
  @IsOptional() @IsString() airline?: string
  @IsOptional() @IsEnum(RefundStatus) status?: RefundStatus
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) customerPaid?: number
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) refundReceived?: number
  @IsOptional() @IsDateString() refundDate?: string
  @IsOptional() @IsString() notes?: string
}