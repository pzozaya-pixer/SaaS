import { IsUUID, IsNotEmpty, IsString } from 'class-validator';

export class SubscribeDto {
  @IsUUID()
  @IsNotEmpty()
  planId!: string;

  @IsString()
  @IsNotEmpty()
  billingCycle!: string; // monthly, yearly
}
