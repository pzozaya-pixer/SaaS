import { Controller, Post, Body, Req, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const userAgent = req.headers['user-agent'];
    // Obtener IP remota de manera segura
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.authService.login(dto, userAgent, ipAddress);
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await this.authService.logout(token);
    }
    return { success: true };
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    const token = authHeader.substring(7);
    const session = await this.authService.validateSession(token);
    const is2fa = this.authService.is2FAEnabled(session.userId);
    return { ...session, is2FAEnabled: is2fa };
  }

  @Post('2fa/generate')
  async generate2FA(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    const token = authHeader.substring(7);
    const session = await this.authService.validateSession(token);
    return this.authService.generate2FASecret(session.userId);
  }

  @Post('2fa/turn-on')
  async turnOn2FA(@Req() req: Request, @Body('code') code: string) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    const token = authHeader.substring(7);
    const session = await this.authService.validateSession(token);
    return this.authService.turnOn2FA(session.userId, code);
  }
}
