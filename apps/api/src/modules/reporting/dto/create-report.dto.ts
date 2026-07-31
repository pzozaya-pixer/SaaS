import { IsString, IsNotEmpty, IsOptional, IsUUID, IsObject } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  source!: string; // CONTACT, CUSTOM_ENTITY, PIPELINE_RECORD, CENTER

  @IsUUID()
  @IsOptional()
  customEntityDefinitionId?: string;

  @IsObject()
  @IsNotEmpty()
  config!: any; // Selected metrics, dimensions, filters, chartType
}
