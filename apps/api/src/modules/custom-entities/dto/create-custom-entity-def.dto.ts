import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCustomEntityDefDto {
  @IsString()
  @IsNotEmpty()
  nameSingular!: string;

  @IsString()
  @IsNotEmpty()
  namePlural!: string;

  @IsString()
  @IsNotEmpty()
  internalName!: string; // e.g. "pet", "car_repair"

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  autoNumberFormat?: string; // e.g. "PET-{0000}"

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
