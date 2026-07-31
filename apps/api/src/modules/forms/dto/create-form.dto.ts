import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID, IsObject, IsDateString } from 'class-validator';

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  targetEntity!: string; // CONTACT, CUSTOM_ENTITY

  @IsUUID()
  @IsOptional()
  customEntityDefinitionId?: string;

  @IsObject()
  @IsNotEmpty()
  structure!: any; // Visual layout (sections, columns, tabs, field order)

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
