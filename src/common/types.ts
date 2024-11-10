export const configKeys = [
  'timeZone',
  'rapidProUrl',
  'rapidProAPIToken',
  'rapidProChannelUUID',
] as const;

export type IConfig = {
  rapidProUrl: string;
  rapidProAPIToken: string;
  rapidProChannelUUID: string;
  timeZone: string;
};

export type ConfigKey = (typeof configKeys)[number];

export type StrDict = {
  [key: string]: string;
};

export type Dictionary = {
  [key: string]: any;
};

export type ATUSSDType = {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
};

export type RapidProResponse = {
  id: number;
  to: string;
  from: string;
  text: string;
  channel: number;
};

export type MessagePayload = {
  phone: string;
  sessionId?: string;
  serviceCode?: string;
  text: string;
  endOfSession: boolean;
  direction: string;
  rapidProMessageId?: string;
  rapidProChannelId?: string;
  createdAt?: Date;
  modifiedAt?: Date;
};

export type RapidProPayload = {
  to: string;
  from: string;
  text: string | number;
  date: string;
};

export type PatientEntity = {
  id?: string;
  code?: string;
  firstName: string;
  lastName: string;
  state: string;
  lga: string;
  ward?: string;
  email: string;
  classification?: string;
  preferredLanguage?: string;
  phoneNumber?: string | null;
  interviewer?: string;
};

export type PMessagePayload = {
  participant: PatientEntity;
  questionId: number;
  question: string;
  response: string;
  options: string[];
  sessionId: string;
  questionNumber: string;
  endofsession: boolean;
};

export type FlattenQuestion = {
  id: number;
  questionId: number;
  question: string;
  options: string[];
  questionNumber: string;
};

export interface MiniSearchResponse extends FlattenQuestion {
  match: Dictionary;
  score: number;
  terms: string[];
}

export type FlowYesNo = {
  YES: '1';
  NO: '2';
};

export type ContinueFlowOptions = {
  MESSAGE: string;
  OPTIONS: FlowYesNo;
};

export type MessageConstants = {
  FLOW_TRIGGER: string;
  FLOW_END_OF_SESSION: string;
  CONTINUE_FLOW: ContinueFlowOptions;
  CONTINUE_EVENT_ON: string;
  MESSAGE_IN: string;
  MESSAGE_OUT: string;
};

export type ParticipantResponse = {
  number: string;
  response: string;
};

export type MinimalResponse = {
  id: number;
  questions: ParticipantResponse[];
};

export type FormattedResponseType = {
  participantId: string;
  response: MinimalResponse[];
};

export type SessionQueryOptions = {
  endSession?: boolean;
  date?: string;
  direction?: string;
};

export type SessionDataType = {
  participantId?: string;
  verifying?: boolean;
  endOfSession: boolean;
  sessionId: string;
  lastSessionId?: string;
  lastInput?: string;
  lastOutput?: string;
  lastQID?: string;
  date?: string;
};

export type VerificationResponse = {
  participantId?: string;
  message: string;
  sessionData?: SessionDataType;
};

export type IndexedQuestionType = { [key: string]: FlattenQuestion };

export interface Question {
  active: boolean;
  questions: SubQuestion[];
  [key: string]: any;
}

export interface SubQuestion {
  active: boolean;
  [key: string]: any;
}
