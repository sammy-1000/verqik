import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions, type AuthUser } from '@verqik/common';
import { HoldEscrowDto } from './dto/payments.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('wallet')
  @RequirePermissions('payments:read')
  getWallet(@CurrentUser() user: AuthUser) {
    return this.paymentsService.getWallet(user.id);
  }

  @Get('transactions')
  @RequirePermissions('payments:read')
  listTransactions(@CurrentUser() user: AuthUser) {
    return this.paymentsService.listTransactions(user.id);
  }

  @Post('escrow/hold')
  @RequirePermissions('payments:write')
  holdEscrow(@CurrentUser() user: AuthUser, @Body() dto: HoldEscrowDto) {
    return this.paymentsService.holdEscrow(user.id, dto);
  }

  @Post('escrow/:id/release')
  @RequirePermissions('payments:write')
  releaseEscrow(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.paymentsService.releaseEscrow(id, user.id);
  }
}
