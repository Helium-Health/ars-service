import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Utility } from '../common/utils/utility';
import { Patient } from './entities/patient.entity';
import { PatientDto } from './dto';

@Injectable()
export class PatientService extends TypeOrmCrudService<Patient> {
  constructor(
    @InjectRepository(Patient)
    private readonly repository: Repository<Patient>,
  ) {
    super(repository);
  }

  getByPhone(phoneNumber: string): Promise<Patient> {
    return this.repository.findOne({
      where: { phoneNumber },
    });
  }

  async getPatients() {
    try {
      const participants = await this.repository.find({
        order: {
          createdAt: 'DESC',
        },
      });

      return participants;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(patientDto: PatientDto) {
    const { phoneNumber } = patientDto;
    try {
      const formattedPhoneNumber = Utility.reformatPhoneNumber(phoneNumber);

      if (!formattedPhoneNumber)
        this.throwBadRequestException({
          message: 'Please use a valid phone number.',
          statusCode: 400,
        });

      const patientByPhone = await this.getByPhone(formattedPhoneNumber);

      if (patientByPhone)
        this.throwBadRequestException({
          message: 'Phone number already registered for a participant!',
          statusCode: 400,
        });

      const code = await this.generateUniqueRandomCode();

      const payload = Object.assign(patientDto, {
        phoneNumber: formattedPhoneNumber,
        code,
      });

      const participant = await this.repository.create({
        ...payload,
      });
      return this.repository.save(participant);
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateUniqueRandomCode() {
    let randomNumber;
    let codeExists = true;

    // Loop until a unique code is found
    while (codeExists) {
      randomNumber = Math.floor(Math.random() * 9000000) + 1000000;
      const code = randomNumber.toString();
      codeExists = await this.checkCodeExistsInDatabase(code);
    }
    return randomNumber.toString();
  }

  async checkCodeExistsInDatabase(code) {
    const participantByCode = await this.getByCode(code);
    return !!participantByCode;
  }

  getByCode(code: string) {
    return this.repository.findOne({
      where: { code },
    });
  }

  formatPhoneOrNull(rawPhoneNumber: unknown): string | null {
    let phoneNumber: string | null = null;
    if (
      !Utility.is.empty(rawPhoneNumber) &&
      Utility.isValidPhoneNumber(String(rawPhoneNumber))
    ) {
      phoneNumber = Utility.reformatPhoneNumber(String(rawPhoneNumber));
    }

    return phoneNumber;
  }
}
