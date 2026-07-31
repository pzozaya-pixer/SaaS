import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class CreateRuleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  trigger!: string;

  @IsObject()
  @IsOptional()
  conditions?: Record<string, any>;

  @IsNotEmpty()
  actions!: any;
}
