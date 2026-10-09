import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsDateString,
  IsEmail,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PassengerType } from '@prisma/client';

export class PassengerDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  documentType!: string;

  @IsString()
  documentNumber!: string;

  @IsDateString()
  birthDate!: string;

  @IsEnum(PassengerType)
  type!: PassengerType;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class CreateBookingDto {
  @IsString()
  tripId!: string;

  @IsOptional()       // ✅ aquí, en CreateBookingDto
  @IsString()
  clientUserId?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe agregar al menos un pasajero' })
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers!: PassengerDto[];

  @IsOptional()
  @IsString()
  specialRequests?: string;
}