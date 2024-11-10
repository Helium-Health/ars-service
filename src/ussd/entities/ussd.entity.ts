import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseModel } from '../../common/entities/base-model';

@Entity()
export class USSDMessage extends BaseModel {
  @ApiProperty()
  @Column({ name: 'service_code', nullable: true })
  serviceCode: string;

  @ApiProperty()
  @Column()
  phone: string;

  @ApiProperty()
  @Column({ nullable: true })
  text: string;

  @ApiProperty()
  @Column({
    name: 'session_id',
    nullable: true,
  })
  sessionId: string;

  @ApiProperty()
  @Column({ name: 'end_of_session', default: false })
  endOfSession: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  direction: string;

  @ApiProperty()
  @Column({ name: 'rapid_pro_message_id', nullable: true })
  rapidProMessageId: string;

  @ApiProperty()
  @Column({ name: 'rapid_pro_channel_id', nullable: true })
  rapidProChannelId: string;

  @Column({ nullable: true })
  questionId: string;
}
