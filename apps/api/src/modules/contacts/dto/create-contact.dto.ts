import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEmail, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAddressDto } from './create-address.dto';

export class CreateContactDto {
  @IsUUID()
  @IsOptional()
  centerId?: string;

  @IsString()
  @IsNotEmpty()
  type!: string; // PERSON, COMPANY

  @IsBoolean()
  @IsOptional()
  isClient?: boolean;

  @IsBoolean()
  @IsOptional()
  isProvider?: boolean;

  @IsBoolean()
  @IsOptional()
  isProspect?: boolean;

  // Person-specific
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  // Company-specific
  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  taxId?: string; // CIF, NIF, RUT

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  @IsOptional()
  addresses?: CreateAddressDto[];
}
