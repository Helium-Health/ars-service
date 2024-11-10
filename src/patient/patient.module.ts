import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { ArsService } from 'src/ars/ars.service';
import { PatientRisks } from 'src/ars/entities/ars.entity';

@Module({
  providers: [PatientService, ArsService],
  controllers: [PatientController],
  imports: [TypeOrmModule.forFeature([Patient, PatientRisks])],
  exports: [PatientService],
})
export class PatientModule {}
