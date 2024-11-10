import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { randomUUID } from 'crypto';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import { FindOptionsOrderValue, Repository } from 'typeorm';
import { messageConstants } from '../common/constant';
import { QID_KEY } from '../common/constant';
import {
  ATUSSDType,
  type MessagePayload,
  RapidProPayload,
  RapidProResponse,
  Dictionary,
  FlattenQuestion,
  type IndexedQuestionType,
} from '../common/types';
import { getConfigValue } from '../common/utils/config';
import { Utility } from '../common/utils/utility';
import { USSDMessage } from './entities/ussd.entity';

@Injectable()
export class UssdService {
  constructor(
    @InjectRepository(USSDMessage)
    private readonly repository: Repository<USSDMessage>,
  ) {}

  create(payload: MessagePayload): Promise<USSDMessage> {
    const data: USSDMessage = this.repository.create(payload);
    return this.repository.save(data);
  }

  getByPhone(
    phoneNumber: string,
    ordering: FindOptionsOrderValue = 'DESC',
  ): Promise<USSDMessage[]> {
    const phone = Utility.reformatPhoneNumber(phoneNumber);
    return this.repository.find({
      where: { phone },
      order: {
        createdAt: ordering,
      },
    });
  }

  getLatestMessage(phone: string, direction = 'in') {
    return this.repository.findOne({
      where: { direction, phone },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  getMessage(text: string, isSessionEnd = false): string {
    const messageStart: string = isSessionEnd ? 'END' : 'CON';

    return `${messageStart} ${text}`;
  }

  getRapidProUrl(
    baseUrl: string,
    channelUUID: string,
    endpoint = 'receive',
  ): string {
    return `${baseUrl}/c/ex/${channelUUID}/${endpoint}`;
  }

  buildRapidProPayload(
    text: string,
    phoneNumber: string,
    serviceCode: string,
  ): RapidProPayload {
    let input: string | number = parseInt(text, 10);
    if (!Utility.is.number(input)) input = text;
    return {
      text: String(input).length === 0 ? messageConstants.FLOW_TRIGGER : input,
      from: phoneNumber,
      to: serviceCode,
      date: new Date().toJSON(),
    };
  }

  verifySessionId(
    sessionId,
    text,
    lastSessionId,
    flowTrigger = messageConstants.FLOW_TRIGGER,
    newSession = randomUUID(),
  ) {
    if (text === flowTrigger) {
      lastSessionId = sessionId;
    } else {
      if (sessionId && sessionId !== lastSessionId) sessionId = lastSessionId;
    }

    if (!sessionId && text === flowTrigger) sessionId = newSession;
    return { sessionId, lastSessionId };
  }

  buildDBMessageFromIncoming(
    message: ATUSSDType,
    endOfSession = false,
  ): MessagePayload {
    const { text, phoneNumber, serviceCode, sessionId } = message;

    return {
      direction: messageConstants.MESSAGE_IN,
      phone: phoneNumber,
      sessionId,
      text,
      serviceCode,
      endOfSession,
    };
  }

  buildDBMessageFromOutgoing(
    message: RapidProResponse,
    endOfSession = false,
  ): MessagePayload {
    return {
      direction: messageConstants.MESSAGE_OUT,
      phone: message.to,
      text: message.text,
      rapidProChannelId: String(message.channel),
      rapidProMessageId: String(message.id),
      endOfSession: endOfSession,
    };
  }

  isEndOfSession(text: string): boolean {
    const firstText = text.split(' ').shift();
    return (
      firstText.toLowerCase() ===
      messageConstants.FLOW_END_OF_SESSION.toLowerCase()
    );
  }

  sendMessageToRepidPro(appUrl: string, payload: RapidProPayload) {
    const postConfig: Dictionary = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    return axios.post(appUrl, payload, postConfig);
  }

  async getLatest(phone: string): Promise<(MessagePayload | null)[]> {
    const lastIn = await this.getLastMessage(
      phone,
      messageConstants.MESSAGE_IN,
    );
    const lastOut = await this.getLastMessage(
      phone,
      messageConstants.MESSAGE_OUT,
    );
    return [lastIn, lastOut];
  }

  async getLastMessage(
    phone: string,
    direction: string,
  ): Promise<MessagePayload> {
    let lastMessage: MessagePayload;
    try {
      lastMessage = await this.getLatestMessage(phone, direction);
    } catch (e: any) {
      Logger.error(e);
    }

    return lastMessage;
  }

  checkRequireResume(lastMessages: (MessagePayload | null)[]) {
    const [lastIn, lastOut] = lastMessages;
    let requireResume = false;
    if (lastOut !== null) {
      const timeZone = getConfigValue('timeZone');
      const today = moment().tz(timeZone).format('L');
      const reportDate = moment(lastOut.createdAt).tz(timeZone).format('L');

      if (
        !lastOut.endOfSession &&
        reportDate === today &&
        lastIn?.text !== messageConstants.FLOW_TRIGGER
      ) {
        requireResume = true;
      }
    }

    return requireResume;
  }

  async getResumeStatus(
    text: string,
    formattedPhone: string,
  ): Promise<boolean> {
    let resumeSession = false;
    if (text === '' || text === messageConstants.FLOW_TRIGGER) {
      const lastMessages: (MessagePayload | null)[] = await this.getLatest(
        formattedPhone,
      );
      resumeSession = this.checkRequireResume(lastMessages);
    }

    return resumeSession;
  }

  getResumeMessage() {
    const compiled: _.TemplateExecutor = _.template(
      messageConstants.CONTINUE_FLOW.MESSAGE,
    );
    const continueMessage: string = compiled(
      messageConstants.CONTINUE_FLOW.OPTIONS,
    );
    return this.getMessage(continueMessage, false);
  }

  findTextInQuestion(text: string) {
    const match: RegExpMatchArray = text.match(QID_KEY);

    if (match) return match[0].toLowerCase().trim();
    return null;
  }

  getQuestionNumberFromKey(qid: string): string {
    const match = qid.match(/[a-c]/);
    if (match) return match[0];
    return null;
  }

  getQuestionIDFromKey(qid: string): string {
    const match = qid.match(/\d{1,2}/);
    if (match) return match[0];
    return null;
  }

  getMessageResponse(text: string, options: string[]): string {
    let response = text;
    const input = parseInt(text, 10);

    if (Utility.is.number(input) && options.length > 0) {
      response = options[input - 1];
    }
    return response;
  }

  getQuestion(text: string, indexedQ: IndexedQuestionType): FlattenQuestion {
    let response: FlattenQuestion;
    const key = this.findTextInQuestion(text);
    if (key && indexedQ) {
      response = indexedQ[key];
    }
    return response;
  }
}
