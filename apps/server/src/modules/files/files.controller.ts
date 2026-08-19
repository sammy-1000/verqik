import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions, type AuthUser } from '@verqik/common';
import { RequestUploadDto } from './dto/files.dto';
import { FilesService } from './files.service';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload-url')
  @RequirePermissions('files:write')
  requestUpload(@CurrentUser() user: AuthUser, @Body() dto: RequestUploadDto) {
    return this.filesService.requestUpload(user.id, dto);
  }

  @Post(':id/confirm')
  @RequirePermissions('files:write')
  confirmUpload(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.filesService.confirmUpload(id, user.id);
  }

  @Get(':id/download-url')
  @RequirePermissions('files:read')
  getDownloadUrl(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.filesService.getDownloadUrl(id, user.id);
  }

  @Delete(':id')
  @RequirePermissions('files:write')
  delete(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.filesService.delete(id, user.id);
  }
}
