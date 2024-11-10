import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseModel } from '../../common/entities/base-model';
import { PLATFORM } from '../../common/enums';

@Entity()
export class PatientRisks extends BaseModel {
  @ApiProperty()
  @Column({
    nullable: false,
  })
  patient_id: string;

  @ApiProperty()
  @Column({
    nullable: false,
  })
  risk_level: string;

  @ApiProperty()
  @Column({
    type: 'float',
    nullable: false,
  })
  risk_value: number;

  @ApiProperty()
  @Column({
    nullable: false,
  })
  patient_response: string;

  @ApiProperty()
  @Column({
    nullable: false,
  })
  recommendation: string;

  @ApiProperty()
  @Column({
    nullable: false,
  })
  platform: PLATFORM;
}
