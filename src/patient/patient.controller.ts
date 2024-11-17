import { Body, Controller, Get, Inject, Post, Res } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { Response } from 'express';
// import * as dayjs from 'dayjs';
import { ApiTags } from '@nestjs/swagger';
import { PatientDto } from './dto';
import { Patient } from './entities/patient.entity';
import { PatientService } from './patient.service';

@Crud({
  model: {
    type: Patient,
  },
  routes: {
    only: ['getManyBase', 'getOneBase', 'createOneBase'],
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  query: {
    exclude: ['id'],
    maxLimit: 100,
    limit: 20,
    alwaysPaginate: false,
    sort: [
      {
        field: 'createdAt',
        order: 'DESC',
      },
    ],
  },
})
@Controller('patient')
@ApiTags('patient/')
export class PatientController implements CrudController<Patient> {
  constructor(
    @Inject(PatientService)
    public service: PatientService,
  ) {}

  get base(): CrudController<Patient> {
    return this;
  }

  @Post()
  createPatient(@Body() patientDto: PatientDto) {
    return this.service.create(patientDto);
  }

  @Get()
  async getPatients(@Res() res: Response) {
    try {
      const patients = await this.service.getPatients();
      res.status(200).json(patients);
    } catch (error) {
      throw new Error(error);
    }
  }
}
