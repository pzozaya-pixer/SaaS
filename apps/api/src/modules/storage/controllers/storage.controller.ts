import { Controller, Post, Delete, Get, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { ActiveOrg } from '../../../common/decorators/active-org.decorator';
import { StorageService } from '../services/storage.service';

@Controller('storage')
@UseGuards(AuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @ActiveOrg() orgId: string,
    @Query('entityName') entityName: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!entityName) {
      throw new BadRequestException('Query parameter entityName is required');
    }
    return this.storageService.uploadFile(orgId, entityName, file);
  }

  @Get('list')
  async listFiles(@ActiveOrg() orgId: string) {
    return this.storageService.listFiles(orgId);
  }

  @Get('presign')
  async getPresignedUrl(@ActiveOrg() orgId: string, @Query('key') key: string) {
    if (!key) {
      throw new BadRequestException('Query parameter key is required');
    }
    return { url: await this.storageService.getPresignedUrl(key) };
  }

  @Delete('delete')
  async deleteFile(
    @ActiveOrg() orgId: string,
    @Query('key') key: string,
    @Query('sizeBytes') sizeBytesStr: string,
  ) {
    if (!key) {
      throw new BadRequestException('Query parameter key is required');
    }
    const sizeBytes = parseInt(sizeBytesStr, 10);
    if (isNaN(sizeBytes)) {
      throw new BadRequestException('Query parameter sizeBytes must be a valid number');
    }
    return this.storageService.deleteFile(orgId, key, sizeBytes);
  }
}
