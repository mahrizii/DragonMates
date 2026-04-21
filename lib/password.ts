import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/** Matches Node's default scrypt options for password-based keys. */
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const;

const KEYLEN = 64;

/**
 * Returns `saltHex:derivedKeyHex` for storage (e.g. user metadata).
 * Salt is passed to scrypt as the same hex string used at hash time so verification stays compatible.
 */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(plain, salt, KEYLEN, SCRYPT_PARAMS).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const idx = stored.indexOf(":");
  if (idx <= 0) return false;
  const salt = stored.slice(0, idx);
  const expectedHex = stored.slice(idx + 1);
  if (!/^[0-9a-f]+$/i.test(salt) || !/^[0-9a-f]+$/i.test(expectedHex)) return false;
  const expected = Buffer.from(expectedHex, "hex");
  if (expected.length !== KEYLEN) return false;
  const derived = scryptSync(plain, salt, KEYLEN, SCRYPT_PARAMS);
  return timingSafeEqual(derived, expected);
}
