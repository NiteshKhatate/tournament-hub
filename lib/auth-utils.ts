import crypto from 'crypto'

/**
 * Generate a random salt
 */
export function generateSalt(length: number = 16): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Encrypt password with base64 encoding
 */
export function encryptPassword(password: string, salt: string): string {
  // Combine password and salt
  const combined = password + salt
  // Encode to base64
  return Buffer.from(combined).toString('base64')
}

/**
 * Verify password with base64 decoding
 */
export function verifyPassword(encryptedPassword: string, inputPassword: string, salt: string): boolean {
  const encrypted = encryptPassword(inputPassword, salt)
  return encrypted === encryptedPassword
}
