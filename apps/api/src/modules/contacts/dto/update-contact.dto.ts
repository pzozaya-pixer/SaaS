import { IsString, IsOptional, IsBoolean, IsEmail, IsUUID, IsArray } from 'class-validator';

export class UpdateContactDto {
  @IsUUID()
  @IsOptional()
  centerId?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsBoolean()
  @IsOptional()
  isClient?: boolean;

  @IsBoolean()
  @IsOptional()
  isProvider?: boolean;

  @IsBoolean()
  @IsOptional()
  isProspect?: boolean;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsUUID()
  @IsOptional()
  ownerId?: string;
}
