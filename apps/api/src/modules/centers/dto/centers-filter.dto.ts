import { IsString, IsOptional } from 'class-validator';

export class CentersFilterDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
