import { MessageConstants } from './types';

export const recommendations = {
  high: {
    riskLevel: 'Red',
    requiredAction:
      'Thank you for completing the questionnaire. Based on the information provided, your pregnancy requires a high level of attention and we recommend that you visit any of our facilities closest to you to continue this survey within the next 24 hours.',
    timeLine: 'Immediately or within 24 hours',
  },
  medium: {
    riskLevel: 'Yellow',
    requiredAction:
      'Thank you for completing the questionnaire. Based on the information provided, your pregnancy requires some level of attention and we recommend that you visit any of our facilities closest to you to continue this survey within the next 2 days.',
    timeLine: 'Within 2 to 3 days',
  },
  low: {
    riskLevel: 'Green',
    requiredAction:
      'Thank you for completing the questionnaire. Based on the information provided, your pregnancy is at no significant risk however we recommend that you visit any of our facilities closest to you to continue this survey within the next 2 days.',
    timeLine: 'Within 1 week',
  },
};

export const messageConstants: Readonly<MessageConstants> = {
  FLOW_TRIGGER: 'ussd',
  FLOW_END_OF_SESSION: 'END',
  CONTINUE_FLOW: {
    MESSAGE:
      'You did not conclude your last session, please select \n <%= YES %>. Continue \n <%= NO %>. Start Again ',
    OPTIONS: {
      YES: '1',
      NO: '2',
    },
  },
  CONTINUE_EVENT_ON: 'on',
  MESSAGE_IN: 'in',
  MESSAGE_OUT: 'out',
};

export const uuidRegex: Readonly<RegExp> =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const optionPairs = {
  17: [
    'Severe headache,Abnormal body movement',
    'Severe headache,Difficulty with seeing',
    'Severe headache,Upper abdominal pain',
    'Severe headache,Leg swelling',
    'Constant (non-stop) headache,Feeling your heart beat fast,Swollen face',
    'None of the above',
  ],
  20: [
    'Fever,Severe body weakness,Severe joint pain',
    'Fever,Frequent urination,Pain on urination',
    'Fever,Vomiting',
    'Lower abdominal pain,Fever',
    'None of the above',
  ],
  22: [
    'Shortness of breath when doing light activities (activities such as sweeping with broomstick; dishwashing),Headache,Swollen feet,Feeling your heart beat fast',
    'Too much water intake,Too much urination,Foamy urine,Dryness of throat',
    'Bone/ Joint pain that comes and goes,Body pain,Shortness of breath when doing light activities (activities such as sweeping with broomstick; dishwashing)',
    'Body swelling,Restlessness,Easily gets tired when doing small work, Feeling your heart beat fast',
    'Seizures /abnormal body movement',
    'Frequent pregnancy loss',
    'Painful leg or legs swelling',
    'Cough beyond 2 weeks,Sweating heavily at night,Sudden/ Unexplained weight loss',
    'None of the above',
  ],
};

export const QUESTION_CACHE: Readonly<string> = 'question-cache';
export const IGNORED_INPUT: Readonly<string[]> = ['0', '#', '##', '99'];
export const QID_KEY: Readonly<RegExp> = /(Q\d{1,2}[a-c]\s)/;

export const questionRegex = /^Q([1-9]|[1-9][0-9])[abc]$/;
