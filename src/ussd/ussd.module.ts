import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArsService } from '../ars/ars.service';
import { PatientRisks } from '../ars/entities/ars.entity';
import { initConfig, storeConfig } from '../common/utils/config';
import { Patient } from '../patient/entities/patient.entity';
import { PatientService } from '../patient/patient.service';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { USSDMessage } from './entities/ussd.entity';
import { UssdService } from './ussd.service';
import { UssdController } from './ussd.controller';

@Module({
  providers: [
    ArsService,
    UssdService,
    RedisCacheService,
    PatientService,
    ArsService,
  ],
  controllers: [UssdController],
  imports: [
    TypeOrmModule.forFeature([USSDMessage, Patient, PatientRisks]),
    RedisCacheModule,
  ],
})
export class UssdModule implements OnModuleInit {
  constructor(private readonly cache: RedisCacheService) {}
  onModuleInit(): any {
    initConfig();
    storeConfig(this.cache.set.bind(this.cache)).catch(console.error);
  }
}
