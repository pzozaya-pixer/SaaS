import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUUID, IsArray } from 'class-validator';

export class CreateCustomFieldDto {
  @IsString()
  @IsNotEmpty()
  targetEntity!: string; // CONTACT, CENTER, CUSTOM_ENTITY

  @IsUUID()
  @IsOptional()
  customEntityDefinitionId?: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsNotEmpty()
  internalName!: string; // e.g. "diet_type"

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  type!: string; // TEXT, NUMBER, DATE, SELECT, etc.

  @IsString()
  @IsOptional()
  defaultValue?: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsBoolean()
  @IsOptional()
  isUnique?: boolean;

  @IsBoolean()
  @IsOptional()
  isIndexable?: boolean;

  @IsBoolean()
  @IsOptional()
  isSearchable?: boolean;

  @IsBoolean()
  @IsOptional()
  isFilterable?: boolean;

  @IsBoolean()
  @IsOptional()
  isSortable?: boolean;

  @IsString()
  @IsOptional()
  validationRegex?: string;

  @IsArray()
  @IsOptional()
  options?: string[];

  @IsOptional()
  conditionalRules?: any;

  @IsOptional()
  permissions?: any;

  @IsString()
  @IsOptional()
  section?: string;
}
