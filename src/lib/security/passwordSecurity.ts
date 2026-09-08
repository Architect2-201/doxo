/**
 * DOXO Password Security & Registration Validator
 * Handles deterministic client-side salted hashing and strict input validation.
 */

export interface RegisterValidationInput {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}

export class PasswordSecurity {
  private static SALT = 'doxo_secure_salt_2026';

  /**
   * Hashes a password using Web Crypto API (SHA-256) with deterministic salt.
   */
  static async hash(password: string): Promise<string> {
    const text = `${this.SALT}:${password}`;
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        console.warn('Web Crypto hash fallback:', e);
      }
    }

    // Fallback hash if Web Crypto unavailable
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `h_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Verifies if input password matches the stored hash
   */
  static async verify(password: string, storedHash: string): Promise<boolean> {
    if (!password || !storedHash) return false;
    const computed = await this.hash(password);
    return computed === storedHash;
  }

  /**
   * Strict validation for registration input
   */
  static validateRegistration(data: RegisterValidationInput): { valid: boolean; error?: string } {
    const name = data.fullName.trim();
    if (!name || name.length < 2) {
      return { valid: false, error: 'გთხოვთ შეიყვანოთ თქვენი სახელი და გვარი.' };
    }

    const email = data.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { valid: false, error: 'გთხოვთ მიუთითოთ სწორი ელ.ფოსტა (მაგ: user@example.com).' };
    }

    const phone = data.phone.trim();
    const digitsOnly = phone.replace(/\D/g, '');
    if (!phone || digitsOnly.length < 9) {
      return { valid: false, error: 'გთხოვთ მიუთითოთ მოქმედი ტელეფონის ნომერი (მინიმუმ 9 ციფრი).' };
    }

    const password = data.password || '';
    if (password.length < 6) {
      return { valid: false, error: 'პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან.' };
    }

    return { valid: true };
  }
}
