/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Validation utilities
 */

import { REGEX, MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from "./constants";

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  return REGEX.EMAIL.test(email.trim());
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  return REGEX.PHONE.test(phone.trim());
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  return REGEX.URL.test(url.trim());
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push(`Password must be less than ${MAX_PASSWORD_LENGTH} characters`);
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate required field
 */
export function isRequired(value: any): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
}

/**
 * Validate min length
 */
export function minLength(value: string, min: number): boolean {
  return value.trim().length >= min;
}

/**
 * Validate max length
 */
export function maxLength(value: string, max: number): boolean {
  return value.trim().length <= max;
}

/**
 * Validate number range
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeInBytes: number): boolean {
  return file.size <= maxSizeInBytes;
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate credit card number (Luhn algorithm)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");

  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate form data
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, ((value: any) => string | null)[]>
): Record<keyof T, string[]> {
  const errors: Record<string, string[]> = {};

  for (const field in rules) {
    const validators = rules[field];
    const value = data[field];
    const fieldErrors: string[] = [];

    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        fieldErrors.push(error);
      }
    }

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  }

  return errors as Record<keyof T, string[]>;
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (fieldName: string) => (value: any) => {
    return isRequired(value) ? null : `${fieldName} is required`;
  },

  email: () => (value: string) => {
    return isValidEmail(value) ? null : "Invalid email address";
  },

  phone: () => (value: string) => {
    return isValidPhone(value) ? null : "Invalid phone number";
  },

  minLength: (min: number) => (value: string) => {
    return minLength(value, min) ? null : `Must be at least ${min} characters`;
  },

  maxLength: (max: number) => (value: string) => {
    return maxLength(value, max) ? null : `Must be less than ${max} characters`;
  },

  password: () => (value: string) => {
    const result = validatePassword(value);
    return result.isValid ? null : result.errors[0];
  },

  match: (otherValue: any, fieldName: string) => (value: any) => {
    return value === otherValue ? null : `Must match ${fieldName}`;
  },

  number: () => (value: any) => {
    return !isNaN(Number(value)) ? null : "Must be a valid number";
  },

  positiveNumber: () => (value: any) => {
    const num = Number(value);
    return !isNaN(num) && num > 0 ? null : "Must be a positive number";
  },
};
