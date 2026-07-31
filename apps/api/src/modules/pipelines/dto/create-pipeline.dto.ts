import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreatePipelineDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  targetEntity!: string; // CONTACT, CUSTOM_ENTITY

  @IsUUID()
  @IsOptional()
  customEntityDefinitionId?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsUUID()
  @IsOptional()
  centerId?: string;
}
