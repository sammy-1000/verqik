import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RequestStatus } from '@verqik/database';

export class CreateDeliveryRequestDto {
  @ApiProperty()
  @IsUUID()
  journeyId: string;

  @ApiProperty()
  @IsString()
  itemDescription: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  itemWeightKg: number;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  agreedPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  itemCategoryId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  declaredValue?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  pickupAddressId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  dropoffAddressId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @ApiPropertyOptional({ type: [String], description: 'Package photo file IDs' })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  itemPhotoFileIds?: string[];
}

export class TransitionDeliveryDto {
  @ApiProperty({ enum: RequestStatus })
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Required when status is PICKED_UP' })
  @IsOptional()
  @IsUUID()
  pickupPhotoFileId?: string;

  @ApiPropertyOptional({ description: 'Required when status is DELIVERED' })
  @IsOptional()
  @IsUUID()
  deliveryPhotoFileId?: string;

  @ApiPropertyOptional({ description: 'Meetup location for pickup or delivery' })
  @IsOptional()
  @IsString()
  rendezvousAddress?: string;
}
