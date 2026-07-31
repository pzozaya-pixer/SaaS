import { IsObject, IsNotEmpty } from 'class-validator';

export class CreateCustomEntityRecordDto {
  @IsObject()
  @IsNotEmpty()
  values!: Record<string, any>;
}
