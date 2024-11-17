import { Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventEmitter } from 'events';
import { type Request, type Response } from 'express';
import {
  IGNORED_INPUT,
  messageConstants,
  QID_KEY,
  QUESTION_CACHE,
} from '../common/constant';
import {
  ConfigKey,
  MessagePayload,
  RapidProPayload,
  SessionDataType,
  VerificationResponse,
} from '../common/types';
import {
  configKeyMap,
  getConfigValue,
  setConfigKey,
  storeConfig,
} from '../common/utils/config';
import { Utility } from '../common/utils/utility';
import { PatientService } from '../patient/patient.service';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { UssdService } from './ussd.service';
import { ArsService } from '../ars/ars.service';

const emitter: EventEmitter = new EventEmitter();

@Controller('/ussd')
@ApiTags('ussd/')
export class UssdController {
  constructor(
    private readonly service: UssdService,
    private readonly cache: RedisCacheService,
    private readonly pService: PatientService,
    private readonly arsService: ArsService,
  ) {}

  async getSession(key): Promise<SessionDataType> {
    let sessionInfo: SessionDataType = {
      endOfSession: undefined,
      sessionId: null,
    };
    const sessionInfoStr: string = await this.cache.get(key);
    if (sessionInfoStr) sessionInfo = JSON.parse(sessionInfoStr);

    return sessionInfo;
  }

  async setSession(key: string, sessionData: SessionDataType) {
    await this.cache.set(
      key,
      JSON.stringify({ ...sessionData, date: new Date().toJSON() }),
    );
  }

  ignoreText(text): boolean {
    let ignore = false;
    const searchPhrases: string[] = ['thank you', 'to proceed'];

    for (let i = 0; i < searchPhrases.length; i += 1) {
      const phrase = searchPhrases[i];
      if (text.indexOf(phrase) > -1) {
        ignore = true;
        break;
      }
    }

    return ignore;
  }

  cleanMessage(text: string): string {
    return this.service
      .getMessage(text, this.service.isEndOfSession(text))
      .replace(messageConstants.FLOW_END_OF_SESSION, '')
      .replace(QID_KEY, '');
  }

  shouldResume(text: string, lastSession: SessionDataType): boolean {
    if (Utility.is.empty(lastSession)) {
      return false;
    }
    const { endOfSession, sessionId } = lastSession;

    return Utility.is.empty(text, true) && !endOfSession && !!sessionId;
  }

  async processOutGoing(
    text,
    sessionInfo,
    lastQID,
    sessionKey,
    lastInput,
    sessionId,
    lastSessionId,
  ) {
    const endOfSession = this.service.isEndOfSession(text);
    const qidKey = IGNORED_INPUT.includes(lastInput)
      ? lastQID
      : this.service.findTextInQuestion(text);

    await this.setSession(sessionKey, {
      ...sessionInfo,
      endOfSession,
      lastOutput: text,
      lastQID: endOfSession ? null : qidKey,
      sessionId: endOfSession ? null : sessionId,
      lastSessionId: endOfSession ? sessionId : lastSessionId,
    });
  }

  async verifyNumber(
    phoneNumber: string,
    participantKey: string,
  ): Promise<VerificationResponse> {
    const participant = await this.pService.getByPhone(phoneNumber);
    await this.cache.set(participantKey, JSON.stringify(participant));
    const response: VerificationResponse = {
      message:
        'Your phone number was not found in the registered participant, kindly provide a code to proceed',
    };
    if (participant) {
      response.participantId = participant.id;
    }

    return response;
  }

  async verifyCode(
    code: string,
    participantKey: string,
  ): Promise<VerificationResponse> {
    const participant = await this.pService.getByCode(
      String(code).toUpperCase(),
    );
    await this.cache.set(participantKey, JSON.stringify(participant));

    const response: VerificationResponse = {
      message: `${messageConstants.FLOW_END_OF_SESSION} The code you provided is not in our record, kindly request an administrator to register you`,
    };

    if (participant) {
      response.participantId = participant.id;
    }
    return response;
  }

  async verifySession(
    phoneNumber: string,
    text,
    sessionInfo: SessionDataType,
    sessionKey: string,
    participantKey: string,
  ): Promise<VerificationResponse> {
    const { participantId } = sessionInfo;
    let response: VerificationResponse;
    if (!Utility.is.empty(participantId))
      return { message: '', participantId, sessionData: sessionInfo };

    const newSessionInfo = { ...sessionInfo, verifying: true };

    if (Utility.is.empty(text)) {
      response = await this.verifyNumber(phoneNumber, participantKey);
    }
    if (!Utility.is.empty(text)) {
      response = await this.verifyCode(text, participantKey);
    }

    if (response.participantId) {
      newSessionInfo.participantId = response.participantId;
      newSessionInfo.verifying = false;
      response.sessionData = newSessionInfo;
    }
    await this.setSession(sessionKey, newSessionInfo);
    return response;
  }

  async cacheMessage(participantMessageKey, messageCachePayload) {
    let messageObj = {};
    let participantMessages = await this.cache.get(participantMessageKey);
    participantMessages
      ? (participantMessages = JSON.parse(participantMessages))
      : undefined;

    const { message, isResponse, parsedQuestion, lastQID } =
      messageCachePayload;
    const { text, sessionId } = message;
    if (!isResponse) {
      const matchedQuestion = this.service.getQuestion(text, parsedQuestion);
      if (matchedQuestion) {
        const { question, questionId, questionNumber, options } =
          matchedQuestion;

        const qNumber = text.split(' ')[0].toLowerCase();

        if (participantMessages) messageObj = participantMessages;

        const questionObj = {
          options,
          question,
          sessionId,
          questionId,
          questionNumber,
          response: '',
        };

        messageObj[qNumber] = questionObj;

        const participantQuestions = JSON.stringify(messageObj);
        await this.cache.set(participantMessageKey, participantQuestions);
      }
    } else {
      if (isResponse && lastQID) {
        const questionNumberFromKey =
          this.service.getQuestionNumberFromKey(lastQID);
        const questionIdFromKey = this.service.getQuestionIDFromKey(lastQID);
        const questionText = `q${questionIdFromKey}${questionNumberFromKey}`;

        const currentMessage = participantMessages[questionText];
        if (currentMessage) {
          const { options } = currentMessage;
          const partResponse = this.service.getMessageResponse(text, options);

          currentMessage.response = partResponse;

          participantMessages[questionText] = currentMessage;
          const pmString = JSON.stringify(participantMessages);
          await this.cache.set(participantMessageKey, pmString);
        }
      }
    }
  }

  @Post('/chat')
  async chat(@Req() request: Request, @Res() response: Response) {
    try {
      const { body } = request;
      let { text, sessionId } = body;
      text = text?.split('*').pop();
      const lastInput = text;
      const { serviceCode, phoneNumber } = body;
      const formattedPhone: string = Utility.reformatPhoneNumber(phoneNumber);
      const eventKey: string = Utility.extractUserPhone(formattedPhone);
      const { continueKey, sessionKey, participantKey, participantMessageKey } =
        this.service.generateKeys(eventKey);

      try {
        let sessionInfo: SessionDataType = await this.getSession(sessionKey);
        const { lastQID, participantId } = sessionInfo || {};
        let { lastSessionId } = sessionInfo || {};

        if (!participantId || Utility.is.empty(text)) {
          const verification: VerificationResponse = await this.verifySession(
            formattedPhone,
            text,
            sessionInfo,
            sessionKey,
            participantKey,
          );

          if (!verification.participantId)
            return response.send(this.cleanMessage(verification.message));
          text = '';
          sessionInfo = verification.sessionData;
        }

        if (this.shouldResume(text, sessionInfo)) {
          await this.cache.set(continueKey, messageConstants.CONTINUE_EVENT_ON);
          return response.send(this.service.getResumeMessage());
        }

        const awaitingContinueResponse = await this.cache.get(continueKey);
        if (awaitingContinueResponse === messageConstants.CONTINUE_EVENT_ON) {
          await this.cache.del(continueKey);
          if (String(text) === messageConstants.CONTINUE_FLOW.OPTIONS.NO) {
            text = messageConstants.FLOW_TRIGGER;
          } else {
            const { lastOutput, lastSessionId } = sessionInfo;
            sessionId = lastSessionId;
            if (lastOutput) {
              text = lastOutput;
              return response.send(this.cleanMessage(text));
            }
          }
        }

        const rapidProChannelUUID: string = getConfigValue(
          configKeyMap.RAPID_PRO_CHANNEL_UUID,
        );

        const rapidProUrl: string = getConfigValue(configKeyMap.RAPID_PRO_URL);
        const appUrl: string = this.service.getRapidProUrl(
          rapidProUrl,
          rapidProChannelUUID,
        );

        const payload: RapidProPayload = this.service.buildRapidProPayload(
          text,
          formattedPhone,
          serviceCode,
        );

        const sessionVerificationRes = this.service.verifySessionId(
          sessionId,
          payload.text,
          lastSessionId,
        );

        sessionId = sessionVerificationRes.sessionId;
        lastSessionId = sessionVerificationRes.lastSessionId;

        const incomingMessage = {
          ...body,
          sessionId,
          text: payload.text,
          phoneNumber: formattedPhone,
        };

        const message: MessagePayload =
          this.service.buildDBMessageFromIncoming(incomingMessage);
        try {
          await this.service.sendMessageToRepidPro(appUrl, payload);
        } catch (e: any) {
          console.error(e);
          return response.json({ error: e?.data || e });
        }

        const participantCache = await this.cache.get(participantKey);
        const participant = JSON.parse(participantCache);

        if (
          message.text !== messageConstants.FLOW_TRIGGER &&
          !IGNORED_INPUT.includes(String(text))
        ) {
          const indexedQuestion = await this.cache.get(QUESTION_CACHE);

          const indexQuestionsObj = JSON.parse(indexedQuestion);

          const messagePayload = {
            message,
            lastQID,
            participant,
            isResponse: true,
            parsedQuestion: indexQuestionsObj,
          };

          await this.cacheMessage(participantMessageKey, messagePayload);
        }

        await this.setSession(sessionKey, {
          ...sessionInfo,
          sessionId,
          lastInput,
          lastSessionId,
        });

        const listener = async (eventBody) => {
          let { text } = eventBody;
          await this.processOutGoing(
            text,
            sessionInfo,
            lastQID,
            sessionKey,
            lastInput,
            sessionId,
            lastSessionId,
          );

          const endOfSession = this.service.isEndOfSession(text);

          try {
            if (endOfSession) {
              const messages = await this.cache.get(participantMessageKey);
              const riskResult = await this.arsService.stratifyUssdRisks({
                patientId: participant.id,
                messages: JSON.parse(messages),
              });

              if (participantCache) {
                await Promise.all([
                  this.cache.del(`participant-${formattedPhone}`),
                  this.cache.del(sessionKey),
                  this.cache.del(participantMessageKey),
                ]);
              }

              text = `${messageConstants.FLOW_END_OF_SESSION} Thank you for taking the assessment. ${riskResult.recommendation}`;
            }

            return response.send(this.cleanMessage(text));
          } catch (error) {
            throw new Error(error);
          } finally {
            emitter.removeListener(eventKey, listener);
          }
        };
        emitter.once(eventKey, listener);
      } catch (error) {
        throw new Error(error);
      }
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  @Post('/receive')
  async getRapidProMessage(@Req() request: Request) {
    const { body } = request;
    const { to, text } = body || {};
    const formattedPhone: string = Utility.reformatPhoneNumber(to);
    const eventKey: string = Utility.extractUserPhone(formattedPhone);
    const { sessionKey, participantKey, participantMessageKey } =
      this.service.generateKeys(eventKey);
    const sessionInfo: SessionDataType = await this.getSession(sessionKey);

    const payload = {
      ...body,
      to: formattedPhone,
      lastSessionId: sessionInfo.lastSessionId,
    };
    const message: MessagePayload = this.service.buildDBMessageFromOutgoing(
      payload,
      this.service.isEndOfSession(text),
    );
    message.sessionId = sessionInfo.sessionId;

    try {
      const participantCache = await this.cache.get(participantKey);
      const participant = JSON.parse(participantCache);

      if (!this.ignoreText(text)) {
        const indexedQuestion = await this.cache.get(QUESTION_CACHE);
        const parsedQuestion = JSON.parse(indexedQuestion);
        const messageCachePayload = {
          message,
          isResponse: false,
          participant,
          parsedQuestion,
        };

        await this.cacheMessage(participantMessageKey, messageCachePayload);
      }
      emitter.emit(eventKey, payload);
      return `message received successfully`;
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  }

  @Get('/config')
  async getConfig() {
    return this.cache.get('config');
  }

  @Get('/config/:key')
  async getConfigByKey(@Param('key') key: ConfigKey) {
    return getConfigValue(key);
  }

  @Post('/config/:key/:value')
  async setConfigValue(
    @Param('key') key: ConfigKey,
    @Param('value') value: string,
  ) {
    setConfigKey(key, value);
    await storeConfig(this.cache.set.bind(this.cache));
  }

  @Get('/:phone')
  getByPhone(@Param('phone') phone: string) {
    return this.service.getByPhone(phone);
  }
}
