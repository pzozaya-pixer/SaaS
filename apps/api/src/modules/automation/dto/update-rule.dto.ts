import { IsString, IsOptional, IsObject, IsBoolean } from 'class-validator';

export class UpdateRuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  trigger?: string;

  @IsObject()
  @IsOptional()
  conditions?: Record<string, any>;

  @IsOptional()
  actions?: any;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
