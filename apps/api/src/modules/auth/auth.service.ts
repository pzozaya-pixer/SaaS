import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------
  // SEGURIDAD / HASHING PBKDF2 NATIVO
  // -------------------------------------------------------------

  hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }

  generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // -------------------------------------------------------------
  // REGISTRO DE USUARIOS E INQUILINOS (TENANTS)
  // -------------------------------------------------------------

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug: dto.organizationSlug },
    });
    if (existingOrg) {
      throw new ConflictException('Organization slug already in use');
    }

    const salt = this.generateSalt();
    const passwordHash = this.hashPassword(dto.password, salt);

    // Registrar mediante transacción transaccional
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear organización
      const org = await tx.organization.create({
        data: {
          name: dto.organizationName,
          slug: dto.organizationSlug,
        },
      });

      // 2. Crear usuario
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash: `${salt}:${passwordHash}`, // Sal y Hash juntos
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      // 3. Vincular como propietario
      await tx.organizationUser.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          isOwner: true,
        },
      });

      // 4. Crear Rol de Administrador por defecto
      const adminRole = await tx.role.create({
        data: {
          organizationId: org.id,
          name: 'Administrator',
          description: 'Control total de la organización',
        },
      });

      // 5. Asignar rol al usuario
      await tx.userRole.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          roleId: adminRole.id,
        },
      });

      return {
        userId: user.id,
        email: user.email,
        organizationId: org.id,
        organizationSlug: org.slug,
      };
    });
  }

  // -------------------------------------------------------------
  // INICIO DE SESIÓN Y PERSISTENCIA
  // -------------------------------------------------------------

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const [salt, storedHash] = user.passwordHash.split(':');
    const computedHash = this.hashPassword(dto.password, salt);

    if (computedHash !== storedHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Obtener la organización asociada
    const orgUser = await this.prisma.organizationUser.findFirst({
      where: { userId: user.id },
    });

    if (!orgUser) {
      throw new UnauthorizedException('User is not associated with any organization');
    }

    // Crear token de sesión aleatorio
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    return {
      userId: user.id,
      email: user.email,
      organizationId: orgUser.organizationId,
      sessionToken: session.token,
      expiresAt: session.expiresAt,
    };
  }

  // -------------------------------------------------------------
  // CIERRE DE SESIÓN
  // -------------------------------------------------------------

  async logout(token: string) {
    return this.prisma.session.updateMany({
      where: { token, isActive: true },
      data: { isActive: false },
    });
  }

  // -------------------------------------------------------------
  // VALIDACIÓN DE TOKEN DE SESIÓN ACTIVA
  // -------------------------------------------------------------

  async validateSession(token: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        token,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          include: {
            organizations: true,
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session invalid or expired');
    }

    const activeOrgId = session.user.organizations[0]?.organizationId;

    return {
      userId: session.user.id,
      email: session.user.email,
      organizationId: activeOrgId,
      sessionId: session.id,
    };
  }
}
