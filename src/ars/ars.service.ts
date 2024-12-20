import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import * as dayjs from 'dayjs';
import { Repository, Between } from 'typeorm';
import {
  RISK_LEVELS,
  PLATFORM,
  riskGradingRules,
  riskGradingValues,
} from '../common/enums';
import {
  recommendations,
  questionRegex,
  optionPairs,
} from '../common/constant';
import { PatientRisks } from './entities/ars.entity';
import { questions, ussdQuestions } from '../questionnaires';
import { DataDto } from './dto/validate-date.dto';
import { Patient } from '../patient/entities/patient.entity';

@Injectable()
export class ArsService extends TypeOrmCrudService<PatientRisks> {
  estimatedEga = 0;
  patientDOB: string;

  constructor(
    @InjectRepository(PatientRisks)
    private readonly repository: Repository<PatientRisks>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {
    super(repository);
  }

  getQuestions(platform) {
    const questionsObj =
      platform === PLATFORM.ussd
        ? ussdQuestions.questions.reduce((acc, question) => {
            return { ...acc, [question.id]: question };
          }, {})
        : questions.questions.reduce((acc, question) => {
            return { ...acc, [question.id]: question };
          }, {});

    return questionsObj;
  }

  async create(patientResponseDto) {
    const { response, platform, patient_id } = patientResponseDto;

    let totalRiskValue = 0;
    // convert questions to dictionary
    const questionsObj = this.getQuestions(platform);

    const overallRisk = [];
    let questionToStratify = [];
    let individualRiskResult = {};
    const patientResponse = response;

    const patient = await this.patientRepo.findOne({
      where: { id: patient_id },
    });
    if (!patient) throw new NotFoundException('Patient not found!');

    try {
      patientResponse.forEach((elem: DataDto) => {
        const questionsTemplate = questionsObj[elem.id.toString()];

        for (let i = 0; i < elem.questions.length; i++) {
          const item = elem.questions[i];

          const questionTemplate = questionsTemplate.questions.find(
            (q) => item.number === q.number,
          );
          questionTemplate.response = item.response;

          individualRiskResult = this.stratifyResponse(questionTemplate);

          questionToStratify.push(individualRiskResult);
          individualRiskResult = {};

          if (
            questionTemplate.canBreakExecution &&
            questionTemplate.breakWhenRiskIs.includes(questionTemplate.risk)
          ) {
            break;
          }
        }

        // get overall risk for a question
        const stratifiedRisk = this.getOverallRisk(questionToStratify);

        totalRiskValue += stratifiedRisk.riskValue;
        stratifiedRisk.id = elem.id;
        questionToStratify = [];
        overallRisk.push(stratifiedRisk);
      });

      const resultantRisk =
        totalRiskValue === 0
          ? 'low'
          : totalRiskValue >= 1 && totalRiskValue <= 6
          ? 'medium'
          : 'high';

      // Add Recommendations
      const recommendation = recommendations[resultantRisk].requiredAction;

      const riskObj = {
        patient_id,
        risk_level: resultantRisk,
        risk_value: totalRiskValue,
        platform,
        patient_response: JSON.stringify(overallRisk),
        recommendation,
      };

      return this.repository.save(this.repository.create(riskObj));
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  stratifyResponse(response: any) {
    let riskLevels = { highRisk: false, mediumRisk: false, lowRisk: false };

    try {
      if (response.inputType === 'date') {
        response.response = this.processDateInput(response);
      } else if (response.inputType === 'number') {
        response.response = parseInt(response.response);
      }

      riskLevels = this.determineRiskLevels(response);

      response.risk = this.assignRiskLevel(riskLevels);

      return response;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Helper function to process date input and return formatted response
  processDateInput(response: any): number {
    const currentDate = new Date();
    const parsedDate = new Date(dayjs(response.response).format());

    const yearsDifference =
      currentDate.getFullYear() - parsedDate.getFullYear();
    const monthsDifference =
      yearsDifference * 12 + (currentDate.getMonth() - parsedDate.getMonth());

    return response.dateFormat === 'months'
      ? monthsDifference
      : yearsDifference;
  }

  // Helper function to determine risk levels based on input type
  determineRiskLevels(response: any) {
    if (response.inputType === 'multi') {
      return response.hasPairedOptions
        ? this.getRiskForPairedOptionQuestions(response)
        : this.getRiskLevelForMultiTypeInput(response);
    } else if (response.inputType === 'number' && response.hasRangeValues) {
      return this.getRiskLevelForRangeOptions(response);
    } else {
      return this.getRiskLevelForOtherInputTypes(response);
    }
  }

  // Helper function to assign the appropriate risk level based on calculated risk levels
  assignRiskLevel(riskLevels: {
    highRisk: boolean;
    mediumRisk: boolean;
    lowRisk: boolean;
  }) {
    const { highRisk, mediumRisk, lowRisk } = riskLevels;

    if ((highRisk && mediumRisk) || (highRisk && lowRisk))
      return RISK_LEVELS.HIGH;
    if (mediumRisk && lowRisk) return RISK_LEVELS.MEDIUM;

    return highRisk
      ? RISK_LEVELS.HIGH
      : mediumRisk
      ? RISK_LEVELS.MEDIUM
      : RISK_LEVELS.LOW;
  }

  getRiskLevelForMultiTypeInput(response) {
    const stratifiedResponse = response.response;

    const highRisk =
      response.highRiskResponse?.length && stratifiedResponse.length
        ? stratifiedResponse.some((item) =>
            response.highRiskResponse.includes(item),
          )
        : false;

    const mediumRisk =
      response.mediumRiskResponse?.length && stratifiedResponse.length
        ? stratifiedResponse.some((item) =>
            response.mediumRiskResponse.includes(item),
          )
        : false;

    const lowRisk =
      response.lowRiskResponse?.length && stratifiedResponse.length
        ? stratifiedResponse.some((item) =>
            response.lowRiskResponse.includes(item),
          )
        : false;

    return { highRisk, mediumRisk, lowRisk };
  }

  getRiskLevelForDiabetesMultiTypeInput(response) {
    const stratifiedResponse = response.response;

    const veryStrongRisk =
      response.veryStrongRiskResponse?.length && stratifiedResponse.length
        ? stratifiedResponse.some((item) =>
            response.veryStrongRiskResponse.includes(item),
          )
        : false;

    const strongRisk =
      response.strongRiskResponse?.length && stratifiedResponse.length
        ? stratifiedResponse.some((item) =>
            response.strongRiskResponse.includes(item),
          )
        : false;

    const weakRisk =
      response.weakRiskResponse?.length && stratifiedResponse.length
        ? stratifiedResponse.some((item) =>
            response.weakRiskResponse.includes(item),
          )
        : false;

    const veryWeakRisk =
      response.veryWeakRiskResponse?.length && stratifiedResponse.length
        ? stratifiedResponse.some((item) =>
            response.veryWeakRiskResponse.includes(item),
          )
        : false;

    const veryVeryLowRisk =
      response.veryVeryLowRiskResponse?.length && stratifiedResponse.length
        ? stratifiedResponse.some((item) =>
            response.veryVeryLowRiskResponse.includes(item),
          )
        : false;

    return {
      veryStrongRisk,
      strongRisk,
      weakRisk,
      veryWeakRisk,
      veryVeryLowRisk,
    };
  }

  getRiskLevelForOtherInputTypes(response) {
    const pirfRisk =
      response.pirfRiskResponse?.length > 0
        ? response.pirfRiskResponse.includes(response.response)
        : false;

    const veryHighRisk =
      response.veryHighRiskResponse?.length > 0
        ? response.veryHighRiskResponse.includes(response.response)
        : false;
    const highRisk =
      response.highRiskResponse?.length > 0
        ? response.highRiskResponse.includes(response.response)
        : false;

    const mediumRisk =
      response.mediumRiskResponse?.length > 0
        ? response.mediumRiskResponse.includes(response.response)
        : false;

    const lowRisk =
      response.lowRiskResponse?.length > 0
        ? response.lowRiskResponse.includes(response.response)
        : false;

    return { pirfRisk, veryHighRisk, highRisk, mediumRisk, lowRisk };
  }

  getRiskLevelForDiabetesInput(response) {
    const veryStrongRisk =
      response.veryStrongRiskResponse?.length > 0
        ? response.veryStrongRiskResponse.includes(response.response)
        : false;

    const strongRisk =
      response.strongRiskResponse?.length > 0
        ? response.strongRiskResponse.includes(response.response)
        : false;

    const weakRisk =
      response.weakRiskResponse?.length > 0
        ? response.weakRiskResponse.includes(response.response)
        : false;

    const veryWeakRisk =
      response.veryWeakRiskResponse?.length > 0
        ? response.veryWeakRiskResponse.includes(response.response)
        : false;

    const veryVeryLowRisk =
      response.veryVeryLowRiskResponse?.length > 0
        ? response.veryVeryLowRiskResponse.includes(response.response)
        : false;

    return {
      veryStrongRisk,
      strongRisk,
      weakRisk,
      veryWeakRisk,
      veryVeryLowRisk,
    };
  }

  getRiskLevelForRangeOptions(response) {
    const highRisk =
      response.highRiskResponse.length > 0 &&
      response.response >= response.highRiskResponse[0] &&
      response.response <= response.highRiskResponse[1];

    const mediumRisk =
      response.mediumRiskResponse.length > 0 &&
      response.response >= response.mediumRiskResponse[0] &&
      response.response <= response.mediumRiskResponse[1];

    const lowRisk =
      response.lowRiskResponse.length > 0 &&
      response.response >= response.lowRiskResponse[0] &&
      response.response <= response.lowRiskResponse[1];

    return { highRisk, mediumRisk, lowRisk };
  }

  formatDateInput(response: any) {
    const formattedRes = response;
    const currentDate = new Date();
    const parsedDate = dayjs(response.response).format();
    const startDate = new Date(parsedDate);
    const numberOfYears = currentDate.getFullYear() - startDate.getFullYear();
    const numberOfMonths =
      (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
      (currentDate.getMonth() - startDate.getMonth());

    response.dateFormat && response.dateFormat === 'months'
      ? (formattedRes.response = numberOfMonths)
      : (formattedRes.response = numberOfYears);

    return formattedRes;
  }

  getOverallRisk(questionToStratify) {
    const stratified = { id: 0, riskValue: 0, questions: [] };

    try {
      // If there's only one question, assign its risk as the final risk value
      if (
        questionToStratify.length === 1 &&
        this.isObject(questionToStratify[0])
      ) {
        const singleQuestion = questionToStratify[0];
        stratified.riskValue = riskGradingValues[singleQuestion.risk] || 0;
        stratified.questions.push({
          number: singleQuestion.number,
          response: singleQuestion.response,
          riskValue: stratified.riskValue,
        });
        return stratified;
      }

      // For multiple questions, compute risk based on risk grading rules
      const riskFactors = questionToStratify.filter(this.isObject).map((e) => {
        const riskValue = riskGradingValues[e.risk];
        stratified.questions.push({
          number: e.number,
          response: e.response,
          riskValue,
        });
        return e.risk;
      });

      // Determine the final risk level based on combined risk factors
      const riskFactorString = riskFactors.join(',').trim();
      const combinedRisk = riskGradingRules[riskFactorString] || 'low';
      stratified.riskValue = riskGradingValues[combinedRisk];

      return stratified;
    } catch (error) {
      throw new Error(
        error.message || 'An error occurred while stratifying risk',
      );
    }
  }

  isObject(data) {
    return typeof data === 'object' && data !== null && data !== undefined;
  }

  getRiskForPairedOptionQuestions(responseObj: any) {
    let highRisk = false;
    let mediumRisk = false;
    let lowRisk = false;

    try {
      // Special condition for question number 19
      if (responseObj.questionNumber === 19) {
        if (
          responseObj.response.includes('Fainting') ||
          responseObj.response.length >= 3
        ) {
          highRisk = true;
        } else if (
          !responseObj.response.includes('None') &&
          responseObj.response.length < 3
        ) {
          mediumRisk = true;
        } else {
          lowRisk = true;
        }
        return { highRisk, mediumRisk, lowRisk };
      }

      // For other question numbers, check paired options
      const optionPairsForQuestion = optionPairs[responseObj.questionNumber];
      const patientResponse = responseObj.response;

      for (const pair of optionPairsForQuestion) {
        const pairedOptions = pair.split(',');

        // Check if patient response includes all options in the pair
        const isMatchedPair = pairedOptions.every((item) =>
          patientResponse.includes(item),
        );
        if (!isMatchedPair) continue;

        if (
          pairedOptions.some((item) =>
            responseObj.highRiskResponse.includes(item),
          )
        ) {
          highRisk = true;
        } else if (
          pairedOptions.some((item) =>
            responseObj.mediumRiskResponse.includes(item),
          )
        ) {
          mediumRisk = true;
        } else if (
          pairedOptions.some((item) =>
            responseObj.lowRiskResponse.includes(item),
          )
        ) {
          lowRisk = true;
        }

        if (highRisk || mediumRisk || lowRisk) break;
      }

      return { highRisk, mediumRisk, lowRisk };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  formatPatientMessages(messages) {
    const formattedQuestions = [];
    let formattedQuestion;
    const messagesToArray = Object.values(messages);
    try {
      const groupedMessages = messagesToArray.reduce((acc, obj: any) => {
        const id = obj.questionId;
        if (!acc[id]) {
          acc[id] = [];
        }
        acc[id].push({
          number: obj.questionNumber,
          response: obj.response,
        });

        return acc;
      }, {});

      for (const [key, value] of Object.entries(groupedMessages)) {
        formattedQuestion = { id: parseInt(key), questions: value };

        formattedQuestions.push(formattedQuestion);
      }

      return { formattedQuestions };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPatientRecord(id: string): Promise<PatientRisks | undefined> {
    try {
      const riskRecord = await this.repository.findOne({
        where: { id },
      });

      if (!riskRecord) {
        throw new NotFoundException({
          message: 'Risk record not found!',
          statusCode: 404,
        });
      }

      return riskRecord;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRecords({ startDate, endDate }) {
    const whereClause = {};

    if (startDate && endDate) {
      whereClause['createdAt'] = Between(startDate, endDate);
    }

    try {
      return this.repository.find({
        where: whereClause,
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (err) {
      throw new HttpException(
        err.message || 'Internal Server Error',
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async stratifyUssdRisks({
    patientId,
    messages,
  }): Promise<PatientRisks | undefined> {
    try {
      const formattedMessagesObj: any = this.formatPatientMessages(messages);
      const { formattedQuestions } = formattedMessagesObj;

      const finalRisk = await this.create({
        patient_id: patientId,
        response: formattedQuestions,
        platform: PLATFORM.ussd,
      });

      return finalRisk;
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
