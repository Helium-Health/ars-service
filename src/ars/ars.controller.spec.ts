import { Test, TestingModule } from '@nestjs/testing';
import { ArsController } from './ars.controller';
import { ArsService } from './ars.service';
import { ValidateDataDto } from './dto/validate-date.dto';
import { PatientRisks } from './entities/ars.entity';
import { CrudRequest } from '@nestjsx/crud';
import { NotFoundException } from '@nestjs/common';

// Mocking the ArsService
const mockArsService = {
  create: jest.fn(),
  getManyBase: jest.fn(),
  getPatientRecord: jest.fn(),
};

// Mocking a CrudRequest
const mockCrudRequest: CrudRequest = {
  parsed: {
    filter: [],
    fields: [],
    paramsFilter: [],
    search: {},
    authPersist: {},
    join: [],
    sort: [],
    limit: 20,
    offset: 0,
    page: 1,
    cache: 0,
    or: [],
    includeDeleted: 0,
  },
  options: {},
};

describe('ArsController', () => {
  let controller: ArsController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let arsService: ArsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArsController],
      providers: [
        {
          provide: ArsService,
          useValue: mockArsService,
        },
      ],
    }).compile();

    controller = module.get<ArsController>(ArsController);
    arsService = module.get<ArsService>(ArsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // describe('getMany', () => {
  //   it('should return multiple patient risk records', async () => {
  //     const mockRisks = [
  //       {
  //         id: '134567890',
  //         patient_id: '12345678',
  //         risk_level: 'high',
  //         patient_response: '',
  //         recommendation: 'random recommendations',
  //         platform: 'web',
  //         risk_value: 0,
  //         createdAt: new Date('2024-10-10'),
  //         updatedAt: new Date('2024-10-11'),
  //       },
  //       {
  //         id: '13456789',
  //         patient_id: '12345678',
  //         risk_level: 'high',
  //         patient_response: '',
  //         recommendation: 'random recommendations',
  //         platform: 'web',
  //         risk_value: 0,
  //         createdAt: new Date('2024-10-10'),
  //         updatedAt: new Date('2024-10-11'),
  //       },
  //     ];

  //     mockArsService.getManyBase.mockResolvedValue(mockRisks);

  //     const result = await controller.getMany(mockCrudRequest);
  //     expect(result).toEqual(mockRisks);
  //     expect(mockArsService.getManyBase).toHaveBeenCalledWith(
  //       mockCrudRequest.parsed,
  //     );
  //   });

  //   it('should handle errors when retrieving multiple records', async () => {
  //     mockArsService.getManyBase.mockRejectedValue(new Error('Test Error'));

  //     await expect(controller.getMany(mockCrudRequest)).rejects.toThrow(
  //       new Error('Test Error'),
  //     );
  //   });
  // });

  describe('stratifyRisks', () => {
    it('should create a new risk record', async () => {
      const mockValidateDataDto: ValidateDataDto = {
        patient_id: '12345678',
        platform: 'web',
        response: [
          {
            id: 1,
            questions: [
              {
                number: 'a',
                response: 0,
              },
            ],
          },
        ],
      };
      const mockPatientRisk: PatientRisks = {
        id: '134567890',
        patient_id: '12345678',
        risk_level: 'high',
        patient_response: '',
        recommendation: 'random recommendations',
        platform: 'web',
        risk_value: 0,
        createdAt: new Date('2024-10-10'),
        updatedAt: new Date('2024-10-11'),
      };
      mockArsService.create.mockResolvedValue(mockPatientRisk);

      const result = await controller.stratifyRisks(mockValidateDataDto);
      expect(result).toEqual(mockPatientRisk);
      expect(mockArsService.create).toHaveBeenCalledWith(mockValidateDataDto);
    });

    it('should handle errors during risk record creation', async () => {
      mockArsService.create.mockRejectedValue(new Error('Creation Error'));

      const mockValidateDataDto: ValidateDataDto = {
        patient_id: '12345678',
        platform: 'web',
        response: [
          {
            id: 1,
            questions: [
              {
                number: 'a',
                response: 0,
              },
            ],
          },
        ],
      };
      await expect(
        controller.stratifyRisks(mockValidateDataDto),
      ).rejects.toThrow(new Error('Creation Error'));
    });
  });

  describe('getPatientRecord', () => {
    it('should return a patient risk record by ID', async () => {
      const mockPatientRisk: PatientRisks = {
        id: '134567890',
        patient_id: '12345678',
        risk_level: 'high',
        patient_response: '',
        recommendation: 'random recommendations',
        platform: 'web',
        risk_value: 0,
        createdAt: new Date('2024-10-10'),
        updatedAt: new Date('2024-10-11'),
      };
      mockArsService.getPatientRecord.mockResolvedValue(mockPatientRisk);

      const result = await controller.getPatientRecord('1');
      expect(result).toEqual(mockPatientRisk);
      expect(mockArsService.getPatientRecord).toHaveBeenCalledWith('1');
    });

    it('should handle errors when retrieving a single patient record', async () => {
      mockArsService.getPatientRecord.mockRejectedValue(
        new NotFoundException('Patient Record Not Found'),
      );

      await expect(controller.getPatientRecord('999')).rejects.toThrow(
        new NotFoundException('Patient Record Not Found'),
      );
    });
  });
});
