import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Res,
  Query,
} from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { Response } from 'express';
import * as dayjs from 'dayjs';
import { ApiTags } from '@nestjs/swagger';
import { Dictionary } from '../common/types';
import { Utility } from '../common/utils/utility';
import { RapidProHookDTO, PatientDto } from './dto';
import { Patient } from './entities/patient.entity';
import { PatientService } from './patient.service';
import { write } from 'fast-csv';

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
  async getParticipants(
    @Res() res: Response,
    @Query('exportFile') exportFile?: boolean,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('state') state?: string,
  ) {
    try {
      const patients = await this.service.getPatients({
        startDate,
        endDate,
        state,
      });

      if (exportFile) {
        if (patients) {
          const results = patients.map((patient, i) => {
            return {
              'S/N': i + 1,
              'First Name': patient.firstName,
              'Last Name': patient.lastName,
              State: patient.state,
              'Phone Number': patient.phoneNumber,
              'Email Address': patient.email,
              Code: patient.code,
              LGA: patient.lga,
            };
          });

          const currentTime = dayjs().format('YYYYMMDDhhmmss');
          const filename = `participants-list-${currentTime}.csv`;
          res.setHeader(
            'Content-disposition',
            `attachment; filename=${filename}`,
          );
          res.writeHead(200, { 'Content-Type': 'text/csv' });
          write(results, { headers: true }).pipe(res);
          return;
        }
      }
      res.status(200).json(patients);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get('/:phone')
  getByPhone(@Param('phone') phone: string) {
    return this.service.getByPhone(phone);
  }

  @Post('/:code/verify-code')
  async verifyCode(@Param('code') code: string) {
    const responseData: Dictionary = { found: 0, detail: null };
    const patient = await this.service.getByCode(code);
    if (patient) {
      responseData.found = 1;
      responseData.detail = patient;
    }

    return responseData;
  }

  @Post('/verify')
  async verify(@Body() dataDTO: RapidProHookDTO) {
    const phoneNumber = (dataDTO.contact?.urn || '').replace('tel:', '');
    const responseData: Dictionary = { found: 0, detail: null };

    let patient = null;
    if (!Utility.is.empty(phoneNumber)) {
      patient = await this.service.getByPhone(
        Utility.reformatPhoneNumber(phoneNumber),
      );
    }

    if (patient) {
      responseData.found = 1;
      responseData.detail = patient;
    }

    return responseData;
  }
}
