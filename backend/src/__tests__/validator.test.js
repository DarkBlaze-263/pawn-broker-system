const {
  isValidEmail,
  isValidPhone,
  isValidAadhar,
  isValidPAN,
  isPositiveNumber,
  isNonNegativeNumber,
  validatePasswordStrength,
  isValidBillNumber,
  isValidItemType,
  isValidPaymentMethod,
  isValidBillStatus,
  isValidPurity,
  isValidAmount,
  validateRequiredFields,
  validateDateRange
} = require('../utils/validators');

describe('Email Validation', () => {
  test('should validate correct email format', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  test('should reject invalid email format', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('invalid@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('test example.com')).toBe(false);
  });

  test('should reject empty email', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });
});

describe('Phone Number Validation', () => {
  test('should validate correct phone format', () => {
    expect(isValidPhone('9876543210')).toBe(true);
    expect(isValidPhone('+91-9876543210')).toBe(true);
    expect(isValidPhone('(987) 654-3210')).toBe(true);
    expect(isValidPhone('9876 543 210')).toBe(true);
  });

  test('should reject invalid phone format', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('abcdefghij')).toBe(false);
    expect(isValidPhone('')).toBe(false);
  });

  test('should handle phone with special characters', () => {
    expect(isValidPhone('+91-98765-43210')).toBe(true);
    expect(isValidPhone('+91 98765 43210')).toBe(true);
  });
});

describe('Aadhar Number Validation', () => {
  test('should validate correct Aadhar format (12 digits)', () => {
    expect(isValidAadhar('123456789012')).toBe(true);
    expect(isValidAadhar('000000000000')).toBe(true);
    expect(isValidAadhar('999999999999')).toBe(true);
  });

  test('should reject invalid Aadhar format', () => {
    expect(isValidAadhar('12345678901')).toBe(false); // 11 digits
    expect(isValidAadhar('1234567890123')).toBe(false); // 13 digits
    expect(isValidAadhar('abcdefghijk')).toBe(false); // letters
    expect(isValidAadhar('123-456-789-012')).toBe(false); // with dashes
  });

  test('should reject empty Aadhar', () => {
    expect(isValidAadhar('')).toBe(false);
    expect(isValidAadhar(null)).toBe(false);
  });
});

describe('PAN Number Validation', () => {
  test('should validate correct PAN format (ABCDE1234F)', () => {
    expect(isValidPAN('ABCDE1234F')).toBe(true);
    expect(isValidPAN('ABCDE9999A')).toBe(true);
    expect(isValidPAN('ZZZZZ0000Z')).toBe(true);
  });

  test('should reject invalid PAN format', () => {
    expect(isValidPAN('ABCDE12345')).toBe(false); // ends with number
    expect(isValidPAN('ABCDE123')).toBe(false); // too short
    expect(isValidPAN('ABCDE12345F')).toBe(false); // too long
    expect(isValidPAN('abcde1234f')).toBe(false); // lowercase
    expect(isValidPAN('12345ABCDE')).toBe(false); // starts with numbers
  });

  test('should reject empty PAN', () => {
    expect(isValidPAN('')).toBe(false);
    expect(isValidPAN(null)).toBe(false);
  });
});

describe('Number Validation', () => {
  test('should validate positive numbers', () => {
    expect(isPositiveNumber(1)).toBe(true);
    expect(isPositiveNumber(100)).toBe(true);
    expect(isPositiveNumber(0.5)).toBe(true);
  });

  test('should reject non-positive numbers', () => {
    expect(isPositiveNumber(0)).toBe(false);
    expect(isPositiveNumber(-1)).toBe(false);
    expect(isPositiveNumber(-100)).toBe(false);
  });

  test('should validate non-negative numbers', () => {
    expect(isNonNegativeNumber(0)).toBe(true);
    expect(isNonNegativeNumber(1)).toBe(true);
    expect(isNonNegativeNumber(100)).toBe(true);
  });

  test('should reject negative numbers for non-negative validation', () => {
    expect(isNonNegativeNumber(-1)).toBe(false);
    expect(isNonNegativeNumber(-100)).toBe(false);
  });

  test('should handle non-number inputs', () => {
    expect(isPositiveNumber('100')).toBe(false);
    expect(isPositiveNumber(null)).toBe(false);
    expect(isPositiveNumber(undefined)).toBe(false);
  });
});

describe('Password Strength Validation', () => {
  test('should validate strong password', () => {
    const result = validatePasswordStrength('StrongP@ssw0rd');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject password without uppercase', () => {
    const result = validatePasswordStrength('weakpassword123!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least 1 uppercase letter');
  });

  test('should reject password without lowercase', () => {
    const result = validatePasswordStrength('WEAKPASSWORD123!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least 1 lowercase letter');
  });

  test('should reject password without number', () => {
    const result = validatePasswordStrength('WeakPassword!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least 1 number');
  });

  test('should reject password without special character', () => {
    const result = validatePasswordStrength('WeakPassword123');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least 1 special character');
  });

  test('should reject short password', () => {
    const result = validatePasswordStrength('Short1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters long');
  });
});

describe('Bill Number Validation', () => {
  test('should validate correct bill number format', () => {
    expect(isValidBillNumber('PB-2024-0001')).toBe(true);
    expect(isValidBillNumber('PB-2023-9999')).toBe(true);
    expect(isValidBillNumber('PB-2099-0001')).toBe(true);
  });

  test('should reject invalid bill number format', () => {
    expect(isValidBillNumber('PB-2024-001')).toBe(false);
    expect(isValidBillNumber('PB-2024-00001')).toBe(false);
    expect(isValidBillNumber('PB-24-0001')).toBe(false);
    expect(isValidBillNumber('PB-2024-ABC')).toBe(false);
    expect(isValidBillNumber('2024-0001')).toBe(false);
  });
});

describe('Item Type Validation', () => {
  test('should validate correct item types', () => {
    expect(isValidItemType('gold')).toBe(true);
    expect(isValidItemType('silver')).toBe(true);
    expect(isValidItemType('platinum')).toBe(true);
    expect(isValidItemType('electronics')).toBe(true);
  });

  test('should reject invalid item types', () => {
    expect(isValidItemType('diamond')).toBe(false);
    expect(isValidItemType('ruby')).toBe(false);
    expect(isValidItemType('')).toBe(false);
    expect(isValidItemType(null)).toBe(false);
  });

  test('should handle case insensitive validation', () => {
    expect(isValidItemType('GOLD')).toBe(true);
    expect(isValidItemType('Gold')).toBe(true);
    expect(isValidItemType('GOLD')).toBe(true);
  });
});

describe('Payment Method Validation', () => {
  test('should validate correct payment methods', () => {
    expect(isValidPaymentMethod('cash')).toBe(true);
    expect(isValidPaymentMethod('card')).toBe(true);
    expect(isValidPaymentMethod('upi')).toBe(true);
    expect(isValidPaymentMethod('bank_transfer')).toBe(true);
    expect(isValidPaymentMethod('cheque')).toBe(true);
  });

  test('should reject invalid payment methods', () => {
    expect(isValidPaymentMethod('bitcoin')).toBe(false);
    expect(isValidPaymentMethod('paypal')).toBe(false);
    expect(isValidPaymentMethod('')).toBe(false);
    expect(isValidPaymentMethod(null)).toBe(false);
  });
});

describe('Bill Status Validation', () => {
  test('should validate correct bill statuses', () => {
    expect(isValidBillStatus('active')).toBe(true);
    expect(isValidBillStatus('closed')).toBe(true);
    expect(isValidBillStatus('forfeited')).toBe(true);
    expect(isValidBillStatus('redeemed')).toBe(true);
  });

  test('should reject invalid bill statuses', () => {
    expect(isValidBillStatus('pending')).toBe(false);
    expect(isValidBillStatus('cancelled')).toBe(false);
    expect(isValidBillStatus('')).toBe(false);
    expect(isValidBillStatus(null)).toBe(false);
  });
});

describe('Purity Validation', () => {
  test('should validate correct purity format', () => {
    expect(isValidPurity('24')).toBe(true);
    expect(isValidPurity('18.5')).toBe(true);
    expect(isValidPurity('22.0')).toBe(true);
    expect(isValidPurity('0.999')).toBe(true);
  });

  test('should reject invalid purity format', () => {
    expect(isValidPurity('24K')).toBe(false);
    expect(isValidPurity('18.5K')).toBe(false);
    expect(isValidPurity('')).toBe(false);
    expect(isValidPurity('abc')).toBe(false);
  });
});

describe('Amount Validation', () => {
  test('should validate correct amount', () => {
    expect(isValidAmount(100)).toBe(true);
    expect(isValidAmount(100.50)).toBe(true);
    expect(isValidAmount(100.99)).toBe(true);
  });

  test('should reject amount with more than 2 decimal places', () => {
    expect(isValidAmount(100.999)).toBe(false);
    expect(isValidAmount(100.1234)).toBe(false);
  });

  test('should reject non-positive amount', () => {
    expect(isValidAmount(0)).toBe(false);
    expect(isValidAmount(-100)).toBe(false);
  });

  test('should handle very large amounts', () => {
    expect(isValidAmount(1000000)).toBe(true);
    expect(isValidAmount(1000000.99)).toBe(true);
  });
});

describe('Required Fields Validation', () => {
  test('should validate all required fields present', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210'
    };
    const requiredFields = ['name', 'email', 'phone'];
    const result = validateRequiredFields(data, requiredFields);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should detect missing required field', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com'
    };
    const requiredFields = ['name', 'email', 'phone'];
    const result = validateRequiredFields(data, requiredFields);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('phone is required');
  });

  test('should detect empty required field', () => {
    const data = {
      name: 'John Doe',
      email: '',
      phone: '9876543210'
    };
    const requiredFields = ['name', 'email', 'phone'];
    const result = validateRequiredFields(data, requiredFields);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('email is required');
  });

  test('should detect whitespace-only required field', () => {
    const data = {
      name: '   ',
      email: 'john@example.com',
      phone: '9876543210'
    };
    const requiredFields = ['name', 'email', 'phone'];
    const result = validateRequiredFields(data, requiredFields);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('name is required');
  });
});

describe('Date Range Validation', () => {
  test('should validate correct date range', () => {
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';
    const result = validateDateRange(startDate, endDate);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject start date after end date', () => {
    const startDate = '2024-12-31';
    const endDate = '2024-01-01';
    const result = validateDateRange(startDate, endDate);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Start date must be before end date');
  });

  test('should reject invalid start date', () => {
    const startDate = 'invalid-date';
    const endDate = '2024-12-31';
    const result = validateDateRange(startDate, endDate);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid start date');
  });

  test('should reject invalid end date', () => {
    const startDate = '2024-01-01';
    const endDate = 'invalid-date';
    const result = validateDateRange(startDate, endDate);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid end date');
  });

  test('should handle null dates', () => {
    const result = validateDateRange(null, null);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should handle single date', () => {
    const result = validateDateRange('2024-01-01', null);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
