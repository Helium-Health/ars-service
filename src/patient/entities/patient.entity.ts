import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseModel } from '../../common/entities/base-model';

@Entity()
export class Patient extends BaseModel {
  @ApiProperty()
  @Column()
  code: string;

  @ApiProperty()
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty()
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty()
  @Column({ name: 'email' })
  email: string;

  @ApiProperty()
  @Column()
  state: string;

  @ApiProperty()
  @Column()
  lga: string;

  @ApiProperty()
  @Column({ name: 'phone_number', nullable: false })
  phoneNumber: string;
}
