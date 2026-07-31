import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateReportDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  config?: any;
}
