import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateJourneyDto {
  @ApiProperty()
  @IsString()
  @Length(2, 2)
  originCountry: string;

  @ApiProperty()
  @IsString()
  originCity: string;

  @ApiProperty()
  @IsString()
  @Length(2, 2)
  destinationCountry: string;

  @ApiProperty()
  @IsString()
  destinationCity: string;

  @ApiProperty()
  @IsDateString()
  departureDate: string;

  @ApiProperty()
  @IsDateString()
  arrivalDate: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  availableWeightKg: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pricePerKg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  flightNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SearchJourneysDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2)
  originCountry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2)
  destinationCountry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  departureFrom?: string;
}
