import crypto = require('crypto');

/**
 * Hashs a given string using SHA256
 * @param {string} str - String to hash 
 * @returns {string} Hashed string
 */ 
export default function hashString(str: string): string {
    return crypto
      .createHash('sha256')
      .update(str)
      .digest('hex');
}
