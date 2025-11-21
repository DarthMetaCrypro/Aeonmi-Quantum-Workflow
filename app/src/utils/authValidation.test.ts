import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, passwordSchema } from './authValidation';

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('validates correct login credentials', () => {
      const validData = {
        email: 'test@example.com',
        password: 'ValidPass123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('rejects invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'ValidPass123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('rejects empty email', () => {
      const invalidData = {
        email: '',
        password: 'ValidPass123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects missing password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });
  });

  describe('registerSchema', () => {
    it('validates correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
        expect(result.data.email).toBe('john@example.com');
      }
    });

    it('rejects password mismatch', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        confirmPassword: 'DifferentPass456',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.issues[0].message.toLowerCase();
        expect(errorMessage).toContain('match');
      }
    });

    it('rejects empty name', () => {
      const invalidData = {
        name: '',
        email: 'test@example.com',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects weak password (too short)', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'Short1',
        confirmPassword: 'Short1',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });
  });

  describe('passwordSchema', () => {
    it('validates strong password', () => {
      const validPasswords = ['Password123', 'SecurePass1', 'MyP@ssw0rd', 'Test1234Pass'];

      validPasswords.forEach((password) => {
        const result = passwordSchema.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    it('rejects password without uppercase', () => {
      const weakPassword = 'password123';
      const result = passwordSchema.safeParse(weakPassword);
      expect(result.success).toBe(false);
    });

    it('rejects password without number', () => {
      const weakPassword = 'PasswordOnly';
      const result = passwordSchema.safeParse(weakPassword);
      expect(result.success).toBe(false);
    });

    it('rejects password too short', () => {
      const weakPassword = 'Pass1';
      const result = passwordSchema.safeParse(weakPassword);
      expect(result.success).toBe(false);
    });

    it('validates minimum 8 characters with uppercase and number', () => {
      const validPassword = 'Abcdef12';
      const result = passwordSchema.safeParse(validPassword);
      expect(result.success).toBe(true);
    });
  });
});
