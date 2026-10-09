import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateDestinationDto {
  @IsString()
  name!: string;

  @IsString()
  country!: string;

  @IsString()
  city!: string;

  @IsString()
  description!: string;

  @IsString()
  coverImage!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
