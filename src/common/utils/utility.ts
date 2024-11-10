import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export class Utility {
  static getType(value: any) {
    const type = Object.prototype.toString.call(value);
    return type
      .replace(/[\[\]]/g, '')
      .toLowerCase()
      .split(' ')
      .pop();
  }

  static is = {
    object: (object: any): boolean =>
      Object.prototype.toString.call(object) === '[object Object]',
    array: (array: any): boolean =>
      Object.prototype.toString.call(array) === '[object Array]',
    string: (text: string): boolean =>
      Object.prototype.toString.call(text) === '[object String]',
    number: (number: any): boolean =>
      Object.prototype.toString.call(number) === '[object Number]' &&
      !isNaN(parseInt(number, 10)),
    date: (date: any) => {
      return (
        Object.prototype.toString.call(date) === '[object Date]' &&
        !Number.isNaN(date.getTime())
      );
    },
    boolean: (bool: any): boolean =>
      Object.prototype.toString.call(bool) === '[object Boolean]',
    empty: (value: any, ignoreZero = false): boolean => {
      let emptyTypes = [null, '', undefined, NaN];
      if (this.is.object(value)) {
        const expectedTypes = ['array', 'date', 'number', 'string'];
        const keys = Object.keys(value);
        if (keys.length === 0) return true;
        let isEmptyObj = false;
        for (let i = 0; i < keys.length; i += 1) {
          const key = keys[i];
          const keyValue = value[key];
          const type = this.getType(keyValue);
          if (expectedTypes.includes(type) && this.is.empty(value[key])) {
            isEmptyObj = true;
            break;
          }
        }
        return isEmptyObj;
      }

      if (this.is.date(value)) return Number.isNaN(value.getTime());

      if (Array.isArray(value) || typeof value === 'string') {
        return value.length === 0;
      }

      if (!ignoreZero) emptyTypes = [...emptyTypes, 0, '0'];
      return emptyTypes.includes(value);
    },
  };

  static reformatPhoneNumber(contact: string, countryCode = 'NG'): string {
    const phoneNumber = phoneUtil.parse(contact.trim(), countryCode);
    return phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
  }

  static isValidPhoneNumber(phoneNumber: string, region = 'NG') {
    let isValid = false;
    try {
      isValid = phoneUtil.isValidNumberForRegion(
        phoneUtil.parse(phoneNumber, region),
        region,
      );
    } catch (e) {
      console.log(e.message);
    }
    return isValid;
  }

  static extractUserPhone(phone: string): string {
    return (phone || '').replace('+', '').replace('234', '');
  }
}
