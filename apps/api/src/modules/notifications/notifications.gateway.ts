import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'notifications',
})
@Injectable()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.query.token as string) ||
      (client.handshake.headers['x-session-token'] as string);

    if (!token) {
      this.logger.warn(`Connection rejected: Missing auth token.`);
      client.disconnect();
      return;
    }

    try {
      const session = await this.prisma.session.findUnique({
        where: { token },
        include: {
          user: {
            include: {
              organizations: true,
            },
          },
        },
      });

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        this.logger.warn(`Connection rejected: Invalid or expired session.`);
        client.disconnect();
        return;
      }

      const orgUser = session.user.organizations[0];
      if (!orgUser) {
        this.logger.warn(`Connection rejected: User has no organizations.`);
        client.disconnect();
        return;
      }

      const organizationId = orgUser.organizationId;
      client.data = { userId: session.userId, organizationId };

      // Unir socket a la sala del inquilino
      await client.join(`org_${organizationId}`);
      this.logger.log(`Client ${client.id} authenticated for user ${session.userId} and joined room org_${organizationId}`);
    } catch (err) {
      this.logger.error(`Error during socket connection:`, err);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected.`);
  }

  // Enviar mensaje en tiempo real a toda una sala de inquilino
  sendToOrg(orgId: string, event: string, payload: any) {
    const roomName = `org_${orgId}`;
    this.server.to(roomName).emit(event, payload);
    this.logger.log(`Broadcasted real-time event "${event}" to room "${roomName}"`);
  }
}
