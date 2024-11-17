import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HttpException, NotFoundException } from '@nestjs/common';
import { ArsService } from './ars.service';
import { PatientRisks } from './entities/ars.entity';
import { Patient } from '../patient/entities/patient.entity';
import { PLATFORM } from '../common/enums';

// Mock data for tests
const mockPatient = {
  id: 'patient-uuid',
  firstName: 'John',
  lastName: 'Doe',
  phoneNumber: '+1234567890',
  email: 'john.doe@example.com',
};

const mockRiskRecord = {
  id: 'risk-uuid',
  patient_id: 'patient-uuid',
  risk_level: 'high',
  risk_value: 5,
  platform: 'web',
  patient_response: JSON.stringify([{ id: 'q1', risk: 'high' }]),
  recommendation: 'Consult a doctor immediately',
};

describe('ArsService', () => {
  let service: ArsService;
  let patientRepo: Repository<Patient>;
  let risksRepo: Repository<PatientRisks>;
  let dataSource: DataSource;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [PatientRisks],
      synchronize: true,
      logging: false,
    });

    await dataSource.initialize();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArsService,
        {
          provide: getRepositoryToken(PatientRisks),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Patient),
          useClass: Repository,
        },
      ],
    })
      .overrideProvider(getRepositoryToken(PatientRisks))
      .useValue(dataSource.getRepository(PatientRisks))
      .compile();

    service = module.get<ArsService>(ArsService);
    risksRepo = dataSource.getRepository(PatientRisks);
    patientRepo = dataSource.getRepository(Patient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('create', () => {
  //   it('should create a new risk record for a patient', async () => {
  //     const mockPatientResponseDto = {
  //       response: [{ id: 1, questions: [{ number: 1, response: 'yes' }] }],
  //       platform: PLATFORM.web,
  //       patient_id: 'patient-uuid',
  //     };
  //     const mockPatientEntity = { ...mockPatient };

  //     // Mocking patient repository methods
  //     jest
  //       .spyOn(patientRepo, 'findOne')
  //       .mockResolvedValue(mockPatientEntity as Patient);
  //     jest
  //       .spyOn(risksRepo, 'create')
  //       .mockReturnValue(mockRiskRecord as PatientRisks);
  //     jest
  //       .spyOn(risksRepo, 'save')
  //       .mockResolvedValue(mockRiskRecord as PatientRisks);

  //     const result = await service.create(mockPatientResponseDto);

  //     expect(result).toEqual(mockRiskRecord);
  //     expect(patientRepo.findOne).toHaveBeenCalledWith({
  //       where: { id: 'patient-uuid' },
  //     });
  //     expect(risksRepo.save).toHaveBeenCalled();
  //   });

  //   it('should throw NotFoundException if patient is not found', async () => {
  //     const mockPatientResponseDto = {
  //       response: [{ id: 1, questions: [{ number: 1, response: 'yes' }] }],
  //       platform: PLATFORM.web,
  //       patient_id: 'non-existent-uuid',
  //     };

  //     jest.spyOn(patientRepo, 'findOne').mockResolvedValue(null);

  //     await expect(service.create(mockPatientResponseDto)).rejects.toThrow(
  //       new NotFoundException('Patient not found!'),
  //     );
  //   });

  //   it('should throw HttpException on save error', async () => {
  //     const mockPatientResponseDto = {
  //       response: [{ id: 1, questions: [{ number: 1, response: 'yes' }] }],
  //       platform: PLATFORM.web,
  //       patient_id: 'patient-uuid',
  //     };
  //     const mockPatientEntity = { ...mockPatient };

  //     jest
  //       .spyOn(patientRepo, 'findOne')
  //       .mockResolvedValue(mockPatientEntity as Patient);
  //     jest.spyOn(risksRepo, 'save').mockRejectedValue(new Error('Save failed'));

  //     await expect(service.create(mockPatientResponseDto)).rejects.toThrow(
  //       new HttpException('Save failed', 500),
  //     );
  //   });
  // });

  describe('getQuestions', () => {
    it('should return web questions object', () => {
      const questions = service.getQuestions(PLATFORM.web);

      // Assuming the questions object should be non-empty
      expect(questions).toBeDefined();
      expect(typeof questions).toBe('object');
    });

    it('should return USSD questions object', () => {
      const questions = service.getQuestions(PLATFORM.ussd);

      // Assuming the questions object should be non-empty
      expect(questions).toBeDefined();
      expect(typeof questions).toBe('object');
    });
  });

  describe('stratifyResponse', () => {
    it('should stratify a date-type response and return risk data', () => {
      const mockResponse = {
        id: 'q1',
        inputType: 'date',
        response: '2024-01-01',
        canBreakExecution: false,
        breakWhenRiskIs: ['high'],
        questions: [],
      };

      const result = service.stratifyResponse(mockResponse);
      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('risk');
    });

    it('should handle numerical input responses correctly', () => {
      const mockResponse = {
        id: 'q2',
        inputType: 'number',
        response: '5',
        canBreakExecution: false,
        breakWhenRiskIs: ['high'],
        questions: [],
      };

      const result = service.stratifyResponse(mockResponse);
      expect(result.response).toBe(5);
    });
  });
});
