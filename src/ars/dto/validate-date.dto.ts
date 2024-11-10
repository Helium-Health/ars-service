import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PLATFORM } from '../../common/enums';

class QuestionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty()
  response: string | number | string[];
}

export class DataDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @IsArray()
  @IsNotEmpty()
  questions: QuestionDto[];
}

export class PatientDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  lga: string;
}

export class ValidateDataDto {
  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => DataDto)
  @IsArray()
  @IsNotEmpty()
  response: DataDto[];

  @ApiProperty()
  @IsString()
  patient_id: string;

  @ApiProperty()
  @IsString()
  platform: PLATFORM;
}

export class DateParams {
  @ApiProperty()
  startDate?: Date;

  @ApiProperty()
  endDate?: Date;
}
