import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TravelPhase } from '@verqik/database';

export class UpdateJourneyTravelDto {
  @ApiPropertyOptional({ enum: TravelPhase })
  @IsOptional()
  @IsEnum(TravelPhase)
  travelPhase?: TravelPhase;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedLandingAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  actualLandingAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 500)
  rendezvousAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  rendezvousNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  travelUpdateNote?: string;
}
