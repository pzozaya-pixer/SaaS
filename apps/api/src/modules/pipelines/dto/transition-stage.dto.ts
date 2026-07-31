import { IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TransitionStageDto {
  @IsUUID()
  @IsNotEmpty()
  targetStageId!: string;

  @IsString()
  @IsOptional()
  lossReason?: string; // required only if target stage is isLost=true
}
