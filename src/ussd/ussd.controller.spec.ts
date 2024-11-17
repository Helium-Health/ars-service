import { Test, TestingModule } from '@nestjs/testing';
import { UssdController } from './ussd.controller';
import { UssdService } from './ussd.service';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { PatientService } from '../patient/patient.service';
import { ArsService } from '../ars/ars.service';
import { Response } from 'express';

// Mocking the dependent services
const mockUssdService = {};
const mockRedisCacheService = {};
const mockPatientService = {};
const mockArsService = {};

describe('UssdController', () => {
  let controller: UssdController;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UssdController],
      providers: [
        {
          provide: UssdService,
          useValue: mockUssdService,
        },
        {
          provide: RedisCacheService,
          useValue: mockRedisCacheService,
        },
        {
          provide: PatientService,
          useValue: mockPatientService,
        },
        {
          provide: ArsService,
          useValue: mockArsService,
        },
      ],
    }).compile();

    controller = module.get<UssdController>(UssdController);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
