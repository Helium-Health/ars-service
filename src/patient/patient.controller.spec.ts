import { Test, TestingModule } from '@nestjs/testing';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { PatientDto } from './dto';
import { Response } from 'express';

// Mocking the PatientService
const mockPatientService = {
  getPatients: jest.fn(),
  create: jest.fn(),
};

describe('PatientController', () => {
  let controller: PatientController;
  let service: PatientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientController],
      providers: [
        {
          provide: PatientService,
          useValue: mockPatientService,
        },
      ],
    }).compile();

    controller = module.get<PatientController>(PatientController);
    service = module.get<PatientService>(PatientService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createPatient', () => {
    it('should call PatientService.create with the correct patientDto', async () => {
      const patientDto: PatientDto = {
        phoneNumber: '1234567890',
        firstName: 'Queen',
        lastName: 'Elizabeth',
        state: 'Lagos',
        lga: 'Alimosho',
        email: 'queen@gmail.com',
      };
      mockPatientService.create.mockResolvedValue(patientDto);

      const result = await controller.createPatient(patientDto);
      expect(service.create).toHaveBeenCalledWith(patientDto);
      expect(result).toEqual(patientDto);
    });
  });

  describe('getPatients', () => {
    it('should call PatientService.getPatients and return result', async () => {
      const mockResponse: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const patients = [
        {
          id: 'uuid',
          phoneNumber: '1234567890',
          firstName: 'Queen',
          lastName: 'Elizabeth',
          state: 'Lagos',
          lga: 'Alimosho',
          email: 'queen@gmail.com',
        },
      ];
      mockPatientService.getPatients.mockResolvedValue(patients);

      await controller.getPatients(mockResponse as Response);
      expect(service.getPatients).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(patients);
    });
  });
});
