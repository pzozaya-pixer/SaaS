import { Module } from '@nestjs/common';
import { PublicApiService } from './public-api.service';
import { RateLimiterService } from './rate-limiter.service';
import { PublicApiController } from './public-api.controller';

@Module({
  controllers: [PublicApiController],
  providers: [PublicApiService, RateLimiterService],
  exports: [PublicApiService, RateLimiterService],
})
export class PublicApiModule {}
