const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/passwordHash');
const { generateToken, verifyToken, decodeToken } = require('../utils/tokenGenerator');

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';

describe('Password Hashing', () => {
  test('should hash a password successfully', async () => {
    const password = 'TestPassword123!';
    const hashedPassword = await hashPassword(password);

    expect(hashedPassword).toBeDefined();
    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword.length).toBeGreaterThan(0);
  });

  test('should compare correct password successfully', async () => {
    const password = 'TestPassword123!';
    const hashedPassword = await hashPassword(password);
    const isValid = await comparePassword(password, hashedPassword);

    expect(isValid).toBe(true);
  });

  test('should fail to compare incorrect password', async () => {
    const password = 'TestPassword123!';
    const wrongPassword = 'WrongPassword123!';
    const hashedPassword = await hashPassword(password);
    const isValid = await comparePassword(wrongPassword, hashedPassword);

    expect(isValid).toBe(false);
  });

  test('should validate strong password', () => {
    const strongPassword = 'StrongP@ssw0rd';
    const result = validatePasswordStrength(strongPassword);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('should reject weak password without uppercase', () => {
    const weakPassword = 'weakpassword123!';
    const result = validatePasswordStrength(weakPassword);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least 1 uppercase letter');
  });

  test('should reject weak password without number', () => {
    const weakPassword = 'WeakPassword!';
    const result = validatePasswordStrength(weakPassword);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least 1 number');
  });

  test('should reject weak password without special character', () => {
    const weakPassword = 'WeakPassword123';
    const result = validatePasswordStrength(weakPassword);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must contain at least 1 special character');
  });

  test('should reject short password', () => {
    const shortPassword = 'Short1!';
    const result = validatePasswordStrength(shortPassword);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters long');
  });
});

describe('JWT Token Generation', () => {
  test('should generate a valid token', () => {
    const payload = { userId: '123', username: 'testuser' };
    const token = generateToken(payload);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  test('should verify a valid token', () => {
    const payload = { userId: '123', username: 'testuser' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.username).toBe(payload.username);
  });

  test('should fail to verify invalid token', () => {
    const invalidToken = 'invalid.token.here';

    expect(() => {
      verifyToken(invalidToken);
    }).toThrow();
  });

  test('should fail to verify expired token', () => {
    const payload = { userId: '123', username: 'testuser' };
    const token = generateToken(payload, '0s'); // Expire immediately

    // Wait a moment for token to expire
    return new Promise(resolve => setTimeout(resolve, 100)).then(() => {
      expect(() => {
        verifyToken(token);
      }).toThrow('Token has expired');
    });
  });

  test('should decode token without verification', () => {
    const payload = { userId: '123', username: 'testuser' };
    const token = generateToken(payload);
    const decoded = decodeToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.username).toBe(payload.username);
  });

  test('should throw error if JWT_SECRET is not defined', () => {
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    expect(() => {
      generateToken({ userId: '123' });
    }).toThrow('JWT_SECRET is not defined');

    process.env.JWT_SECRET = originalSecret;
  });
});

describe('Token Expiration', () => {
  test('should generate token with custom expiration', () => {
    const payload = { userId: '123', username: 'testuser' };
    const token = generateToken(payload, '1h');

    expect(token).toBeDefined();
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
  });

  test('should use default expiration if not specified', () => {
    const payload = { userId: '123', username: 'testuser' };
    const token = generateToken(payload);

    expect(token).toBeDefined();
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
  });
});

describe('Invalid Token Handling', () => {
  test('should handle malformed token', () => {
    const malformedToken = 'not.a.valid.jwt';

    expect(() => {
      verifyToken(malformedToken);
    }).toThrow('Invalid token');
  });

  test('should handle empty token', () => {
    expect(() => {
      verifyToken('');
    }).toThrow('Invalid token');
  });

  test('should handle null token', () => {
    expect(() => {
      verifyToken(null);
    }).toThrow();
  });

  test('should handle token with wrong signature', () => {
    const payload = { userId: '123', username: 'testuser' };
    const token = generateToken(payload);
    const tamperedToken = token + 'tampered';

    expect(() => {
      verifyToken(tamperedToken);
    }).toThrow('Invalid token');
  });
});
