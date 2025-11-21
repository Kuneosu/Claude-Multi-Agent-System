import { describe, it, expect } from 'vitest';
import { DICE_SIZE, CAMERA_FOV, ROTATION_MAP, COLORS } from './constants';

describe('constants', () => {
  describe('DICE_SIZE', () => {
    it('should be a positive number', () => {
      expect(DICE_SIZE).toBeGreaterThan(0);
    });
  });

  describe('CAMERA_FOV', () => {
    it('should be a reasonable FOV value', () => {
      expect(CAMERA_FOV).toBeGreaterThan(0);
      expect(CAMERA_FOV).toBeLessThan(180);
    });
  });

  describe('ROTATION_MAP', () => {
    it('should have entries for faces 1-6', () => {
      for (let i = 1; i <= 6; i++) {
        expect(ROTATION_MAP[i]).toBeDefined();
        expect(Array.isArray(ROTATION_MAP[i])).toBe(true);
        expect(ROTATION_MAP[i]).toHaveLength(3);
      }
    });

    it('should have valid rotation values (radians)', () => {
      Object.values(ROTATION_MAP).forEach(rotation => {
        rotation.forEach(value => {
          expect(typeof value).toBe('number');
          expect(Number.isFinite(value)).toBe(true);
        });
      });
    });
  });

  describe('COLORS', () => {
    it('should have required color properties', () => {
      expect(COLORS).toHaveProperty('primary');
      expect(COLORS).toHaveProperty('diceBody');
      expect(COLORS).toHaveProperty('diceDots');
    });

    it('should have valid hex color values', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      expect(COLORS.primary).toMatch(hexRegex);
      expect(COLORS.diceBody).toMatch(hexRegex);
      expect(COLORS.diceDots).toMatch(hexRegex);
    });
  });
});
