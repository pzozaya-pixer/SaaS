import { Injectable } from '@nestjs/common';

@Injectable()
export class RateLimiterService {
  private readonly buckets = new Map<string, number[]>();

  isRateLimited(key: string, limit: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const timestamps = this.buckets.get(key) || [];

    // Filtrar marcas de tiempo dentro de la ventana de rate limit
    const validTimestamps = timestamps.filter(t => now - t < windowMs);

    if (validTimestamps.length >= limit) {
      return true;
    }

    validTimestamps.push(now);
    this.buckets.set(key, validTimestamps);
    return false;
  }
}
