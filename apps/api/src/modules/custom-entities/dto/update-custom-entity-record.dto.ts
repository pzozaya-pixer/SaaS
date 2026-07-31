import { IsObject, IsNotEmpty } from 'class-validator';

export class UpdateCustomEntityRecordDto {
  @IsObject()
  @IsNotEmpty()
  values!: Record<string, any>;
}
