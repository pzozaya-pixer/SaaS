import { Controller, Get, Post, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { DataImportService } from './data-import.service';
import { ActiveOrg } from '../../common/decorators/active-org.decorator';
import { AuthGuard } from '../../common/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('data-import')
@UseGuards(AuthGuard)
export class DataImportController {
  constructor(private readonly dataImportService: DataImportService) {}

  @Post('contacts')
  @UseInterceptors(FileInterceptor('file'))
  async importContacts(
    @ActiveOrg() orgId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }
    return this.dataImportService.requestContactsImport(orgId, file);
  }

  @Get('status/:jobId')
  getJobStatus(@ActiveOrg() orgId: string, @Param('jobId') jobId: string) {
    return this.dataImportService.getJobStatus(orgId, jobId);
  }
}
