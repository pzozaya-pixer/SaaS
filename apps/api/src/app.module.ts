import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { CentersModule } from './modules/centers/centers.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { CustomFieldsModule } from './modules/custom-fields/custom-fields.module';
import { CustomEntitiesModule } from './modules/custom-entities/custom-entities.module';
import { FormsModule } from './modules/forms/forms.module';
import { PipelinesModule } from './modules/pipelines/pipelines.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { DashboardsModule } from './modules/dashboards/dashboards.module';
import { PluginsModule } from './modules/plugins/plugins.module';
import { BillingModule } from './modules/billing/billing.module';
import { AutomationModule } from './modules/automation/automation.module';
import { PublicApiModule } from './modules/public-api/public-api.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { StorageModule } from './modules/storage/storage.module';
import { EmailModule } from './modules/email/email.module';
import { DataExportModule } from './modules/data-export/data-export.module';
import { DataImportModule } from './modules/data-import/data-import.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { I18nModule } from './common/i18n/i18n.module';

@Module({
  imports: [
    I18nModule,
    DatabaseModule,
    CentersModule,
    ContactsModule,
    CustomFieldsModule,
    CustomEntitiesModule,
    FormsModule,
    PipelinesModule,
    ReportingModule,
    DashboardsModule,
    PluginsModule,
    BillingModule,
    AutomationModule,
    PublicApiModule,
    AuditModule,
    AuthModule,
    StorageModule,
    EmailModule,
    DataExportModule,
    DataImportModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
