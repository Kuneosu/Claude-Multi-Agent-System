import { describe, it, expect } from 'vitest';
import { generateRandomNumber, getTargetRotation, generateRandomSpin } from './diceUtils';
import { ROTATION_MAP } from './constants';

describe('generateRandomNumber', () => {
  it('should return a number between 1 and 6', () => {
    for (let i = 0; i < 100; i++) {
      const result = generateRandomNumber();
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    }
  });

  it('should return an integer', () => {
    for (let i = 0; i < 20; i++) {
      const result = generateRandomNumber();
      expect(Number.isInteger(result)).toBe(true);
    }
  });
});

describe('getTargetRotation', () => {
  it('should return correct rotation for each dice face', () => {
    for (let i = 1; i <= 6; i++) {
      const rotation = getTargetRotation(i);
      expect(rotation).toEqual(ROTATION_MAP[i]);
    }
  });

  it('should return undefined for invalid input', () => {
    expect(getTargetRotation(0)).toBeUndefined();
    expect(getTargetRotation(7)).toBeUndefined();
  });
});

describe('generateRandomSpin', () => {
  it('should return an object with x, y, z properties', () => {
    const spin = generateRandomSpin();
    expect(spin).toHaveProperty('x');
    expect(spin).toHaveProperty('y');
    expect(spin).toHaveProperty('z');
  });

  it('should return x and y values between 4π and 8π', () => {
    for (let i = 0; i < 20; i++) {
      const spin = generateRandomSpin();
      expect(spin.x).toBeGreaterThanOrEqual(Math.PI * 4);
      expect(spin.x).toBeLessThanOrEqual(Math.PI * 8);
      expect(spin.y).toBeGreaterThanOrEqual(Math.PI * 4);
      expect(spin.y).toBeLessThanOrEqual(Math.PI * 8);
    }
  });

  it('should return z values between 2π and 4π', () => {
    for (let i = 0; i < 20; i++) {
      const spin = generateRandomSpin();
      expect(spin.z).toBeGreaterThanOrEqual(Math.PI * 2);
      expect(spin.z).toBeLessThanOrEqual(Math.PI * 4);
    }
  });
});
