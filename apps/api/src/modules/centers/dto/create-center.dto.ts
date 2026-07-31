import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEmail, IsObject } from 'class-validator';

export class CreateCenterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsObject()
  @IsOptional()
  schedule?: any;

  @IsString()
  @IsOptional()
  status?: string;
}
