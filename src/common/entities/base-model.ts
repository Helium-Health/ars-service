import { ApiHideProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  // DeleteDateColumn,
} from 'typeorm';

export abstract class BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiHideProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiHideProperty()
  @UpdateDateColumn({
    select: false,
  })
  updatedAt: Date;

  // @ApiHideProperty()
  // @DeleteDateColumn()
  // deletedAt?: Date;
}
