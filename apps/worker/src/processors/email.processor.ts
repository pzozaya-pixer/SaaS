import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Processor('emails')
@Injectable()
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private transporter!: nodemailer.Transporter;

  constructor() {
    super();
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`SMTP transporter initialized pointing to ${host}:${port}`);
    } else {
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      this.logger.log('SMTP config missing. Initialized fallback JSON mail transporter.');
    }
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing email job ${job.id} of type ${job.name}`);
    const { to, context } = job.data;

    let subject = 'Notificación de SaaS';
    let html = '';

    if (job.name === 'send_welcome_email') {
      subject = `¡Bienvenido a SaaS, ${context.firstName || 'Usuario'}!`;
      html = this.compileWelcomeTemplate(context.firstName, context.organizationName);
    } else {
      html = `<p>Notificación genérica del sistema.</p>`;
    }

    const from = process.env.SMTP_FROM || 'SaaS Platform <noreply@saas.com>';

    const info = await this.transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    this.logger.log(`Email job ${job.id} sent successfully. MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  }

  private compileWelcomeTemplate(firstName: string, orgName: string): string {
    const templateHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>¡Hola, {{ firstName }}!</h2>
        <p>Estamos muy felices de darte la bienvenida a nuestra plataforma SaaS.</p>
        <p>Tu organización <strong>{{ organizationName }}</strong> se ha registrado correctamente y ya puedes comenzar a trabajar.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666;">Este correo fue enviado de manera automática, por favor no respondas directamente.</p>
      </div>
    `;

    return templateHtml
      .replace(/\{\{\s*firstName\s*\}\}/g, firstName || 'Usuario')
      .replace(/\{\{\s*organizationName\s*\}\}/g, orgName || 'tu organización');
  }
}
