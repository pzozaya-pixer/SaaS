import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class UpdateCustomFieldDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  defaultValue?: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

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
