import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PatientService } from './patient.service';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dto';
import { Utility } from '../common/utils/utility';
import { HttpException } from '@nestjs/common';

// Mocking the Utility class
jest.mock('../common/utils/utility', () => ({
  Utility: {
    reformatPhoneNumber: jest.fn((phone) => `+1${phone}`),
    is: {
      empty: jest.fn((value) => !value),
    },
    isValidPhoneNumber: jest.fn((phone) => phone.length === 10),
  },
}));

describe('PatientService', () => {
  let service: PatientService;
  let repository: Repository<Patient>;
  let dataSource: DataSource;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [Patient],
      synchronize: true,
      logging: false,
    });

    await dataSource.initialize();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: getRepositoryToken(Patient),
          useClass: Repository,
        },
      ],
    })
      .overrideProvider(getRepositoryToken(Patient))
      .useValue(dataSource.getRepository(Patient))
      .compile();

    service = module.get<PatientService>(PatientService);
    repository = dataSource.getRepository(Patient);
  });

  afterEach(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getByPhone', () => {
    it('should return a patient by phone number', async () => {
      const mockPatient = {
        id: 'random-uuid',
        phoneNumber: '1234567890',
        firstName: 'Queen',
        lastName: 'Elizabeth',
        state: 'Lagos',
        lga: 'Alimosho',
        email: 'queen@gmail.com',
      };
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(mockPatient as Patient);

      const result = await service.getByPhone('+1234567890');
      expect(result).toEqual(mockPatient);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { phoneNumber: '+1234567890' },
      });
    });
  });

  describe('getPatients', () => {
    it('should return all patients ordered by createdAt DESC', async () => {
      const mockPatients = [
        {
          id: 'random-uuid',
          phoneNumber: '1234567890',
          firstName: 'Queen',
          lastName: 'Elizabeth',
          state: '',
          lga: '',
          email: 'queen@gmail.com',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'random-uuid2',
          phoneNumber: '1234567890',
          firstName: 'Queen',
          lastName: 'Elizabeth',
          state: 'Lagos',
          lga: 'Alimosho',
          email: 'queen@gmail.com',
          createdAt: new Date('2024-01-02'),
        },
      ];
      jest
        .spyOn(repository, 'find')
        .mockResolvedValue(mockPatients as Patient[]);

      const result = await service.getPatients();
      expect(result).toEqual(mockPatients);
      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('should throw an internal server error if an exception occurs', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Test Error'));

      await expect(service.getPatients()).rejects.toThrow(
        new HttpException('Test Error', 500),
      );
    });
  });

  describe('create', () => {
    it('should create a new patient successfully', async () => {
      const mockPatientDto: PatientDto = {
        phoneNumber: '1234567890',
        firstName: 'Queen',
        lastName: 'Elizabeth',
        state: 'Lagos',
        lga: 'Alimosho',
        email: 'queen@gmail.com',
      };
      const formattedPhoneNumber = '+11234567890';

      jest.spyOn(service, 'getByPhone').mockResolvedValue(null);
      jest
        .spyOn(service, 'generateUniqueRandomCode')
        .mockResolvedValue('1234567');
      jest
        .spyOn(repository, 'create')
        .mockReturnValue(mockPatientDto as Patient);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue(mockPatientDto as Patient);

      const result = await service.create(mockPatientDto);
      expect(result).toEqual(mockPatientDto);
      expect(Utility.reformatPhoneNumber).toHaveBeenCalledWith('1234567890');
      expect(repository.save).toHaveBeenCalledWith({
        ...mockPatientDto,
        phoneNumber: formattedPhoneNumber,
        code: '1234567',
      });
    });

    it('should throw an error if the phone number is already registered', async () => {
      const mockPatientDto: PatientDto = {
        phoneNumber: '1234567890',
        firstName: 'Queen',
        lastName: 'Elizabeth',
        state: 'Lagos',
        lga: 'Alimosho',
        email: 'queen@gmail.com',
      };
      jest.spyOn(service, 'getByPhone').mockResolvedValue({} as Patient);

      await expect(service.create(mockPatientDto)).rejects.toThrow(
        new HttpException(
          'Phone number already registered for a participant!',
          400,
        ),
      );
    });
  });

  describe('generateUniqueRandomCode', () => {
    it('should generate a unique random code', async () => {
      jest.spyOn(service, 'checkCodeExistsInDatabase').mockResolvedValue(false);

      const code = await service.generateUniqueRandomCode();
      expect(code).toHaveLength(7);
      expect(service.checkCodeExistsInDatabase).toHaveBeenCalled();
    });
  });
});
