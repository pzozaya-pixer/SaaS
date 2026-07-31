import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateDashboardDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
