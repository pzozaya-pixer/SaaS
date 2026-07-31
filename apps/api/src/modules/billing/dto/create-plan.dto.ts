import { IsString, IsNotEmpty, IsOptional, IsNumber, IsObject, IsArray } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  priceMonthly!: number;

  @IsNumber()
  @IsNotEmpty()
  priceYearly!: number;

  @IsObject()
  @IsNotEmpty()
  limits!: Record<string, any>; // limits of this plan

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];
}
