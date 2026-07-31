import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { PublicApiService } from '../public-api.service';
import { RateLimiterService } from '../rate-limiter.service';

@Injectable()
export class PublicApiKeyGuard implements CanActivate {
  constructor(
    private readonly publicApiService: PublicApiService,
    private readonly rateLimiterService: RateLimiterService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('Missing x-api-key header');
    }

    // 1. Validar Key y obtener Org Context
    const keyRecord = await this.publicApiService.validateApiKey(apiKey);

    // 2. Comprobar Rate Limiting
    const isLimited = this.rateLimiterService.isRateLimited(apiKey);
    if (isLimited) {
      throw new HttpException('Too Many Requests: Rate limit exceeded (100 req/min)', HttpStatus.TOO_MANY_REQUESTS);
    }

    // Inyectar organizationId en request para uso del decorador @ActiveOrg()
    request.organizationId = keyRecord.organizationId;
    return true;
  }
}
