import { IsString, IsOptional, IsUUID, IsObject } from 'class-validator';

export class UpdateWidgetDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsUUID()
  @IsOptional()
  reportId?: string;

  @IsObject()
  @IsOptional()
  config?: any;
}
