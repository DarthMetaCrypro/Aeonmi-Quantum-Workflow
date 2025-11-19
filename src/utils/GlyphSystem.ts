import * as SecureStore from 'expo-secure-store';

export class GlyphSystem {
  private static readonly GLYPH_KEY = 'aeonmi_glyph';

  // Generate a random glyph pattern
  static generateGlyph(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let glyph = '';
    for (let i = 0; i < 8; i++) {
      glyph += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return glyph;
  }

  // Store glyph securely
  static async storeGlyph(glyph: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.GLYPH_KEY, glyph);
    } catch (error) {
      console.error('Failed to store glyph:', error);
    }
  }

  // Retrieve stored glyph
  static async getStoredGlyph(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.GLYPH_KEY);
    } catch (error) {
      console.error('Failed to retrieve glyph:', error);
      return null;
    }
  }

  // Validate glyph input
  static validateGlyph(input: string): boolean {
    return /^[A-Z0-9]{8}$/.test(input);
  }
}