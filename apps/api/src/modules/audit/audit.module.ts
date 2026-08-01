import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { TelemetryController } from './telemetry.controller';

@Global()
@Module({
  controllers: [AuditController, TelemetryController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
