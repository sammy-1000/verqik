import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RaiseDisputeDto {
  @ApiProperty()
  @IsUUID()
  deliveryRequestId: string;

  @ApiProperty()
  @IsString()
  reason: string;
}

export class ResolveDisputeDto {
  @ApiProperty()
  @IsString()
  resolution: string;
}
