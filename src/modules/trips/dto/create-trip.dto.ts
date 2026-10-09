import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsDateString,
  IsBoolean,
  IsEnum,
  IsPositive,
  IsInt,
  Min,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TripStatus } from '@prisma/client';

export class CreateItineraryItemDto {
  @IsInt()
  @IsPositive()
  day!: number;

  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  activities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  meals?: string[];

  @IsOptional()
  @IsString()
  accommodation?: string;
}

export class CreateTripDto {
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  highlights?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludes?: string[];

  @IsString()
  coverImage!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsDateString()
  departureDate!: string;

  @IsDateString()
  returnDate!: string;

  @IsNumber()
  @IsPositive()
  price!: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  priceChild?: number;

  @IsInt()
  @IsPositive()
  capacity!: number;

  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @IsString()
  departureCity!: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsString()
  destinationId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItineraryItemDto)
  itinerary?: CreateItineraryItemDto[];
}
