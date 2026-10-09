import {
  IsString, IsOptional, IsEnum, IsArray,
  ValidateNested, IsDateString, IsNumber, Min, ArrayMinSize
} from 'class-validator'
import { Type, Transform } from 'class-transformer'
import { RefundStatus } from '@prisma/client'

export class CreateSegmentDto {
  @IsString() origin: string
  @IsString() destination: string
  @IsDateString() departureDate: string
  @IsNumber() @Min(0) @Type(() => Number) ticketPrice: number
  @IsNumber() @Min(0) @Type(() => Number) refundOptionPrice: number
}

export class CreateRefundDto {
  @IsString() passengerName: string
  @IsString() pnr: string
  @IsOptional() @IsString() caseNumber?: string
  @IsString() airline: string
  @IsOptional() @IsEnum(RefundStatus) status?: RefundStatus
  @IsNumber() @Min(0) @Type(() => Number) customerPaid: number
  @IsOptional() @IsNumber() @Min(0) @Type(() => Number) refundReceived?: number
  @IsOptional() @IsDateString() refundDate?: string
  @IsOptional() @IsString() notes?: string

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSegmentDto)
  segments: CreateSegmentDto[]
}