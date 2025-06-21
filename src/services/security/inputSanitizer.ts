// Input sanitization service to prevent XSS and injection attacks

export class InputSanitizer {
  // HTML entities for escaping
  private readonly htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  // Dangerous HTML tags to remove
  private readonly dangerousTags = [
    'script', 'iframe', 'object', 'embed', 'form', 'input', 'button',
    'select', 'textarea', 'link', 'meta', 'style', 'base', 'applet'
  ];

  // Dangerous attributes to remove
  private readonly dangerousAttributes = [
    'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout',
    'onkeydown', 'onkeyup', 'onkeypress', 'onfocus', 'onblur',
    'onchange', 'onsubmit', 'onreset', 'javascript:', 'vbscript:',
    'data:', 'about:'
  ];

  // SQL injection patterns
  private readonly sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(;|\-\-|\#|\/\*|\*\/)/g,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(\b(OR|AND)\s+['"]\w+['"]?\s*=\s*['"]\w+['"]?)/gi
  ];

  // Sanitize HTML content
  public sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Remove dangerous tags
    this.dangerousTags.forEach(tag => {
      const regex = new RegExp(`<\\/?${tag}[^>]*>`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    // Remove dangerous attributes
    this.dangerousAttributes.forEach(attr => {
      const regex = new RegExp(`\\s${attr}\\s*=\\s*[^\\s>]*`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });

    // Escape HTML entities
    sanitized = sanitized.replace(/[&<>"'`=\/]/g, (match) => {
      return this.htmlEntities[match] || match;
    });

    return sanitized;
  }

  // Sanitize text input (escape HTML entities)
  public sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input.replace(/[&<>"'`=\/]/g, (match) => {
      return this.htmlEntities[match] || match;
    });
  }

  // Sanitize and validate medical data
  public sanitizeMedicalData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized: any = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeText(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeMedicalData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  // Check for SQL injection patterns
  public detectSqlInjection(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    return this.sqlPatterns.some(pattern => pattern.test(input));
  }

  // Sanitize SQL input (for parameterized queries)
  public sanitizeSqlInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove or escape dangerous characters
    return input
      .replace(/[';\\]/g, '') // Remove semicolons and backslashes
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .trim();
  }

  // Validate and sanitize email
  public sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      return '';
    }

    // Basic email sanitization
    const sanitized = email
      .toLowerCase()
      .trim()
      .replace(/[<>"']/g, '');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized) ? sanitized : '';
  }

  // Validate and sanitize phone number
  public sanitizePhone(phone: string): string {
    if (!phone || typeof phone !== 'string') {
      return '';
    }

    // Remove all non-digit characters except + and spaces
    return phone.replace(/[^\d\+\s\-\(\)]/g, '').trim();
  }

  // Sanitize file names
  public sanitizeFileName(fileName: string): string {
    if (!fileName || typeof fileName !== 'string') {
      return '';
    }

    // Remove dangerous characters and limit length
    return fileName
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
      .replace(/^\.+/, '') // Remove leading dots
      .substring(0, 255)
      .trim();
  }

  // Validate and sanitize URLs
  public sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      return '';
    }

    try {
      const parsed = new URL(url);
      
      // Only allow safe protocols
      const allowedProtocols = ['http:', 'https:', 'mailto:'];
      if (!allowedProtocols.includes(parsed.protocol)) {
        return '';
      }

      return parsed.toString();
    } catch (error) {
      return '';
    }
  }

  // Sanitize patient data specifically
  public sanitizePatientData(patientData: any): any {
    const sanitized = this.sanitizeMedicalData(patientData);

    // Additional patient-specific sanitization
    if (sanitized.email) {
      sanitized.email = this.sanitizeEmail(sanitized.email);
    }

    if (sanitized.phone) {
      sanitized.phone = this.sanitizePhone(sanitized.phone);
    }

    // Sanitize medical record numbers (alphanumeric only)
    if (sanitized.medicalRecordNumber) {
      sanitized.medicalRecordNumber = sanitized.medicalRecordNumber.replace(/[^a-zA-Z0-9]/g, '');
    }

    return sanitized;
  }

  // Sanitize vital signs data
  public sanitizeVitalSigns(vitalsData: any): any {
    const sanitized = { ...vitalsData };

    // Ensure numeric values are actually numbers
    const numericFields = [
      'heartRate', 'systolicBp', 'diastolicBp', 'temperature',
      'oxygenSaturation', 'respiratoryRate', 'weight', 'height'
    ];

    numericFields.forEach(field => {
      if (sanitized[field] !== undefined) {
        const num = parseFloat(sanitized[field]);
        sanitized[field] = isNaN(num) ? undefined : num;
      }
    });

    // Sanitize text fields
    if (sanitized.notes) {
      sanitized.notes = this.sanitizeText(sanitized.notes);
    }

    return sanitized;
  }

  // Check for potentially malicious content
  public isSuspiciousContent(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /data:text\/html/i,
      /onload\s*=/i,
      /onerror\s*=/i,
      /eval\s*\(/i,
      /document\.cookie/i,
      /window\.location/i,
      /alert\s*\(/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
  }

  // Comprehensive input validation and sanitization
  public validateAndSanitize(input: any, type: 'text' | 'html' | 'email' | 'phone' | 'url' | 'medical'): {
    isValid: boolean;
    sanitized: any;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let sanitized = input;
    let isValid = true;

    if (typeof input === 'string') {
      // Check for suspicious content
      if (this.isSuspiciousContent(input)) {
        warnings.push('Potentially malicious content detected');
        isValid = false;
      }

      // Check for SQL injection
      if (this.detectSqlInjection(input)) {
        warnings.push('SQL injection pattern detected');
        isValid = false;
      }

      // Sanitize based on type
      switch (type) {
        case 'text':
          sanitized = this.sanitizeText(input);
          break;
        case 'html':
          sanitized = this.sanitizeHtml(input);
          break;
        case 'email':
          sanitized = this.sanitizeEmail(input);
          if (!sanitized && input) {
            warnings.push('Invalid email format');
            isValid = false;
          }
          break;
        case 'phone':
          sanitized = this.sanitizePhone(input);
          break;
        case 'url':
          sanitized = this.sanitizeUrl(input);
          if (!sanitized && input) {
            warnings.push('Invalid or unsafe URL');
            isValid = false;
          }
          break;
        case 'medical':
          sanitized = this.sanitizeMedicalData(input);
          break;
      }
    }

    return {
      isValid,
      sanitized,
      warnings
    };
  }
}

export const inputSanitizer = new InputSanitizer();