import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRelationDto {
  @IsUUID()
  @IsNotEmpty()
  targetContactId!: string;

  @IsString()
  @IsNotEmpty()
  relationType!: string; // EMPLOYEE_OF, SPOUSE_OF, etc.
}
