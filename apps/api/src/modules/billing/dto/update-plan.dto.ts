import { IsString, IsOptional, IsNumber, IsObject, IsArray, IsBoolean } from 'class-validator';

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  priceMonthly?: number;

  @IsNumber()
  @IsOptional()
  priceYearly?: number;

  @IsObject()
  @IsOptional()
  limits?: Record<string, any>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
