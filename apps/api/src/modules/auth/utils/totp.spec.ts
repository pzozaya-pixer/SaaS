import { generateTOTPSecret, verifyTOTP } from './totp';

describe('TOTP Utils', () => {
  it('should generate a secret and qrCodeUrl compatible with otpauth', () => {
    const { secret, qrCodeUrl } = generateTOTPSecret();
    expect(secret).toHaveLength(16);
    expect(qrCodeUrl).toContain('otpauth://totp/');
    expect(qrCodeUrl).toContain(secret);
  });

  it('should fail with invalid token', () => {
    const { secret } = generateTOTPSecret();
    const isValid = verifyTOTP('123456', secret);
    expect(isValid).toBe(false);
  });
});
