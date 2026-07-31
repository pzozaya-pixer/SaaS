import { IsString, IsNotEmpty, IsOptional, IsUUID, IsNumber, IsArray, IsDateString, IsInt } from 'class-validator';

export class CreateRecordDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @IsUUID()
  @IsOptional()
  contactId?: string;

  @IsUUID()
  @IsOptional()
  customEntityRecordId?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsInt()
  @IsOptional()
  probability?: number;

  @IsDateString()
  @IsOptional()
  expectedCloseDate?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
