import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCustomEntityDefDto {
  @IsString()
  @IsOptional()
  nameSingular?: string;

  @IsString()
  @IsOptional()
  namePlural?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  autoNumberFormat?: string;

  @IsBoolean()
  @IsOptional()
  isVisibleInMenu?: boolean;

  @IsBoolean()
  @IsOptional()
  allowFiles?: boolean;

  @IsBoolean()
  @IsOptional()
  allowActivities?: boolean;

  @IsBoolean()
  @IsOptional()
  allowComments?: boolean;

  @IsBoolean()
  @IsOptional()
  allowPipelines?: boolean;

  @IsBoolean()
  @IsOptional()
  allowTags?: boolean;

  @IsBoolean()
  @IsOptional()
  allowImportExport?: boolean;

  @IsBoolean()
  @IsOptional()
  allowApi?: boolean;

  @IsBoolean()
  @IsOptional()
  allowPublicForms?: boolean;
}
