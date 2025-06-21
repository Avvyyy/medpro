// Input validation schemas and utilities

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'phone' | 'date' | 'boolean';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

class ValidationService {
  public validate(data: any, schema: ValidationSchema): ValidationResult {
    const errors: Record<string, string> = {};

    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field];
      const error = this.validateField(value, rule, field);
      
      if (error) {
        errors[field] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  private validateField(value: any, rule: ValidationRule, fieldName: string): string | null {
    // Required validation
    if (rule.required && (value === undefined || value === null || value === '')) {
      return `${this.formatFieldName(fieldName)} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return null;
    }

    // Type validation
    if (rule.type) {
      const typeError = this.validateType(value, rule.type, fieldName);
      if (typeError) return typeError;
    }

    // Length validation for strings
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return `${this.formatFieldName(fieldName)} must be at least ${rule.minLength} characters`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `${this.formatFieldName(fieldName)} must not exceed ${rule.maxLength} characters`;
      }
    }

    // Numeric range validation
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return `${this.formatFieldName(fieldName)} must be at least ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        return `${this.formatFieldName(fieldName)} must not exceed ${rule.max}`;
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        return `${this.formatFieldName(fieldName)} format is invalid`;
      }
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }

  private validateType(value: any, type: string, fieldName: string): string | null {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          return `${this.formatFieldName(fieldName)} must be a string`;
        }
        break;
      
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return `${this.formatFieldName(fieldName)} must be a valid number`;
        }
        break;
      
      case 'email':
        if (typeof value !== 'string' || !this.isValidEmail(value)) {
          return `${this.formatFieldName(fieldName)} must be a valid email address`;
        }
        break;
      
      case 'phone':
        if (typeof value !== 'string' || !this.isValidPhone(value)) {
          return `${this.formatFieldName(fieldName)} must be a valid phone number`;
        }
        break;
      
      case 'date':
        if (!this.isValidDate(value)) {
          return `${this.formatFieldName(fieldName)} must be a valid date`;
        }
        break;
      
      case 'boolean':
        if (typeof value !== 'boolean') {
          return `${this.formatFieldName(fieldName)} must be true or false`;
        }
        break;
    }

    return null;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  private isValidDate(date: any): boolean {
    if (typeof date === 'string') {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }
    return date instanceof Date && !isNaN(date.getTime());
  }

  private formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}

// Predefined validation schemas
export const VALIDATION_SCHEMAS = {
  LOGIN: {
    email: { required: true, type: 'email' as const },
    password: { required: true, type: 'string' as const, minLength: 1 }
  },

  REGISTER: {
    firstName: { required: true, type: 'string' as const, minLength: 2, maxLength: 50 },
    lastName: { required: true, type: 'string' as const, minLength: 2, maxLength: 50 },
    email: { required: true, type: 'email' as const },
    password: { required: true, type: 'string' as const, minLength: 8, maxLength: 128 },
    role: { required: true, type: 'string' as const },
    phone: { type: 'phone' as const },
    licenseNumber: { type: 'string' as const, minLength: 5, maxLength: 20 }
  },

  PATIENT: {
    firstName: { required: true, type: 'string' as const, minLength: 2, maxLength: 50 },
    lastName: { required: true, type: 'string' as const, minLength: 2, maxLength: 50 },
    dateOfBirth: { required: true, type: 'date' as const },
    gender: { required: true, type: 'string' as const },
    email: { type: 'email' as const },
    phone: { type: 'phone' as const },
    assignedDoctorId: { required: true, type: 'string' as const }
  },

  VITAL_SIGNS: {
    patientId: { required: true, type: 'string' as const },
    heartRate: { type: 'number' as const, min: 20, max: 250 },
    systolicBp: { type: 'number' as const, min: 50, max: 250 },
    diastolicBp: { type: 'number' as const, min: 30, max: 150 },
    temperature: { type: 'number' as const, min: 90, max: 115 },
    oxygenSaturation: { type: 'number' as const, min: 70, max: 100 },
    respiratoryRate: { type: 'number' as const, min: 5, max: 60 },
    weight: { type: 'number' as const, min: 20, max: 800 }
  },

  ALERT: {
    patientId: { required: true, type: 'string' as const },
    title: { required: true, type: 'string' as const, minLength: 5, maxLength: 100 },
    message: { required: true, type: 'string' as const, minLength: 10, maxLength: 500 },
    severity: { required: true, type: 'string' as const },
    priority: { required: true, type: 'string' as const }
  },

  ALERT_THRESHOLD: {
    vitalType: { required: true, type: 'string' as const },
    condition: { required: true, type: 'string' as const },
    thresholdValue: { required: true, type: 'number' as const },
    severity: { required: true, type: 'string' as const }
  }
};

export const validationService = new ValidationService();