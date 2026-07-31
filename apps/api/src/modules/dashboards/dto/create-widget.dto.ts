import { IsString, IsNotEmpty, IsOptional, IsUUID, IsObject } from 'class-validator';

export class CreateWidgetDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  type!: string; // KPI, CHART, FUNNEL, ALERT

  @IsUUID()
  @IsOptional()
  reportId?: string;

  @IsObject()
  @IsNotEmpty()
  config!: any; // layout { x, y, w, h } and widget-specific options
}
