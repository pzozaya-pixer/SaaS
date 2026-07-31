import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsOptional()
  type?: string; // main, billing, shipping

  @IsString()
  @IsNotEmpty()
  street!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsNotEmpty()
  country!: string;
}
