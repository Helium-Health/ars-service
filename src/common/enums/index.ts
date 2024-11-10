const RISK_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

const riskGradingRules = {
  high: 'high',
  medium: 'medium',
  low: 'low',
  'high,high': 'high',
  'high,medium': 'medium',
  'high,low': 'low',
  'low,low': 'low',
  'medium,low': 'low',
  'medium,medium': 'medium',
  'high,high,high': 'high',
  'high,high,medium': 'medium',
  'high,medium,high': 'medium',
  'high,medium,medium': 'medium',
  'high,high,low': 'low',
};

const riskGradingValues = {
  high: 7,
  medium: 1,
  low: 0,
};

enum PLATFORM {
  web = 'web',
  ussd = 'ussd',
}

enum NOTIFICATION {
  EMAIL = 'email',
  SMS = 'sms',
}

enum NOTIFICATION_TYPE {
  PARTICIPANT_REGISTRATION = 'PARTICIPANT_REGISTRATION',
  STRATIFICATION_RESULT = 'STRATIFICATION_RESULT',
  STRATIFICATION_RESULT_HELIUM_DOC = 'STRATIFICATION_RESULT_HELIUM_DOC',
}

export {
  RISK_LEVELS,
  riskGradingRules,
  riskGradingValues,
  PLATFORM,
  NOTIFICATION,
  NOTIFICATION_TYPE,
};
