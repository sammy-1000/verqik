import { IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethodType } from '@verqik/database';

export class HoldEscrowDto {
  @ApiProperty()
  @IsUUID()
  deliveryRequestId: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: PaymentMethodType })
  @IsEnum(PaymentMethodType)
  method: PaymentMethodType;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  platformFee?: number;
}
