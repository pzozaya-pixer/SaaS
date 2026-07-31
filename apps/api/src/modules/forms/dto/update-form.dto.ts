import { IsString, IsOptional, IsBoolean, IsObject, IsDateString } from 'class-validator';

export class UpdateFormDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  structure?: any;

  @IsObject()
  @IsOptional()
  conditionalRules?: any;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @IsObject()
  @IsOptional()
  consents?: any;

  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @IsString()
  @IsOptional()
  successMessage?: string;

  @IsString()
  @IsOptional()
  redirectUrl?: string;

  @IsObject()
  @IsOptional()
  webhooks?: any;
}
