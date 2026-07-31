import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Processor('data-jobs')
@Injectable()
export class DataExportProcessor extends WorkerHost {
  private readonly logger = new Logger(DataExportProcessor.name);
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private readonly prisma: PrismaService) {
    super();
    this.bucketName = process.env.MINIO_BUCKET || 'saas-attachments';
    this.s3Client = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
      region: process.env.MINIO_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'minio_admin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'minio_secure_password',
      },
      forcePathStyle: true,
    });
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing data job ${job.id} of type ${job.name}`);
    const { organizationId } = job.data;

    if (job.name === 'export_contacts') {
      // 1. Obtener los contactos del inquilino desde base de datos
      const contacts = await this.prisma.contact.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
      });

      // 2. Generar el formato CSV
      const headers = ['ID', 'Type', 'First Name', 'Last Name', 'Company Name', 'Email', 'Phone', 'Created At'];
      const rows = contacts.map(c => [
        c.id,
        c.type,
        c.firstName || '',
        c.lastName || '',
        c.companyName || '',
        c.email || '',
        c.phone || '',
        c.createdAt.toISOString(),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      const buffer = Buffer.from(csvContent, 'utf-8');
      const key = `${organizationId}/exports/contacts_${job.id}.csv`;

      // 3. Subir archivo a MinIO/S3
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: buffer,
          ContentType: 'text/csv',
        }),
      );

      this.logger.log(`Contacts export finished successfully. Key: ${key}`);
      return { success: true, key };
    }

    throw new Error(`Unsupported job type: ${job.name}`);
  }
}
