import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  Crud,
  CrudController,
  Override,
  ParsedRequest,
  CrudRequest,
} from '@nestjsx/crud';
import { ArsService } from './ars.service';
import { PatientRisks } from './entities/ars.entity';
import { ValidateDataDto } from './dto/validate-date.dto';
import { PatientService } from 'src/patient/patient.service';

@Crud({
  model: {
    type: PatientRisks,
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
    alwaysPaginate: true,
    sort: [
      {
        field: 'createdAt',
        order: 'DESC',
      },
    ],
  },
})
@Controller('/ars')
@ApiTags('ars/')
export class ArsController implements CrudController<PatientRisks> {
  constructor(
    public service: ArsService,
    private readonly patientService: PatientService,
  ) {}

  get base(): CrudController<PatientRisks> {
    return this;
  }

  @Post('/stratify')
  async stratifyRisks(
    @Body() responseDto: ValidateDataDto,
  ): Promise<PatientRisks> {
    try {
      return this.service.create({ ...responseDto });
    } catch (error) {
      throw new Error(error);
    }
  }

  @Override('getManyBase')
  getMany(@ParsedRequest() req: CrudRequest) {
    try {
      return this.base.getManyBase(req);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get('/results/:id')
  getPatientRecord(@Param('id') id: string): Promise<PatientRisks> {
    try {
      return this.service.getPatientRecord(id);
    } catch (error) {
      throw new Error(error);
    }
  }
}
