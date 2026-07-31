import { Controller, Get } from '@nestjs/common';
import { AuditService } from './audit.service';
import { ActiveOrg } from '../../common/decorators/active-org.decorator';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@ActiveOrg() orgId: string) {
    return this.auditService.findAll(orgId);
  }
}
