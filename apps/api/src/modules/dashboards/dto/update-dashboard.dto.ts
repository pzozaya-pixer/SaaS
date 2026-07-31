import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class UpdateDashboardDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsObject()
  @IsOptional()
  config?: any;
}
