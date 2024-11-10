import { Module } from '@nestjs/common';
import { ArsService } from './ars.service';
import { ArsController } from './ars.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientRisks } from './entities/ars.entity';
import { PatientService } from '../patient/patient.service';
import { Patient } from 'src/patient/entities/patient.entity';

@Module({
  controllers: [ArsController],
  providers: [ArsService, PatientService],
  imports: [TypeOrmModule.forFeature([PatientRisks, Patient])],
  exports: [ArsService],
})
export class ArsModule {}
