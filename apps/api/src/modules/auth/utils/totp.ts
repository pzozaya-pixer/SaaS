import * as crypto from 'crypto';

export function generateTOTPSecret(): { secret: string; qrCodeUrl: string; base32Secret: string } {
  // Generar secreto base32 (16 chars)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let base32Secret = '';
  for (let i = 0; i < 16; i++) {
    base32Secret += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  const qrCodeUrl = `otpauth://totp/SaaS:User?secret=${base32Secret}&issuer=SaaS`;
  return { secret: base32Secret, qrCodeUrl, base32Secret };
}

function decodeBase32(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < base32.length; i++) {
    const idx = alphabet.indexOf(base32[i].toUpperCase());
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    while (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(output);
}

export function verifyTOTP(token: string, secret: string): boolean {
  try {
    const key = decodeBase32(secret);
    const time = Math.floor(Date.now() / 1000 / 30);
    
    // Validar ventana de tiempo -1, 0, +1
    for (let i = -1; i <= 1; i++) {
      const counter = Buffer.alloc(8);
      const timeVal = BigInt(time + i);
      counter.writeBigInt64BE(timeVal, 0);

      const hmac = crypto.createHmac('sha1', key);
      hmac.update(counter);
      const digest = hmac.digest();

      const offset = digest[digest.length - 1] & 0xf;
      const binary =
        ((digest[offset] & 0x7f) << 24) |
        ((digest[offset + 1] & 0xff) << 16) |
        ((digest[offset + 2] & 0xff) << 8) |
        (digest[offset + 3] & 0xff);

      const otp = (binary % 1000000).toString().padStart(6, '0');
      if (otp === token) {
        return true;
      }
    }
  } catch (err) {
    return false;
  }
  return false;
}
