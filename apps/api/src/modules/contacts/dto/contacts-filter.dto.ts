import { IsString, IsOptional, IsBooleanString } from 'class-validator';

export class ContactsFilterDto {
  @IsString()
  @IsOptional()
  type?: string; // PERSON, COMPANY

  @IsBooleanString()
  @IsOptional()
  isClient?: string;

  @IsBooleanString()
  @IsOptional()
  isProvider?: string;

  @IsBooleanString()
  @IsOptional()
  isProspect?: string;

  @IsString()
  @IsOptional()
  centerId?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  search?: string; // search by name, email, companyName, taxId
}
