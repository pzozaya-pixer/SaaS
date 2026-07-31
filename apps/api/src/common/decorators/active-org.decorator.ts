import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

export const ActiveOrg = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const orgId = request.headers['x-organization-id'];
    
    if (!orgId) {
      throw new BadRequestException('Missing active organization header (x-organization-id)');
    }
    
    return orgId;
  },
);
