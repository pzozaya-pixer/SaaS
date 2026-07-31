import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean, IsArray } from 'class-validator';

export class CreateStageDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  color?: string; // HEX color

  @IsBoolean()
  @IsOptional()
  isWon?: boolean;

  @IsBoolean()
  @IsOptional()
  isLost?: boolean;

  @IsInt()
  @IsOptional()
  probability?: number;

  @IsInt()
  @IsOptional()
  targetDays?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredFields?: string[]; // Array of custom field internalNames

  @IsOptional()
  transitionRules?: any;
}
