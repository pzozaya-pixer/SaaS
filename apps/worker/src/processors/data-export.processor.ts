import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

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
      const contacts = await this.prisma.contact.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' },
      });

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

    if (job.name === 'import_contacts') {
      const { fileKey } = job.data;

      // 1. Descargar el archivo temporal desde S3/MinIO
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
        }),
      );

      const csvContent = await response.Body?.transformToString('utf-8');
      if (!csvContent) {
        throw new Error(`CSV file body is empty for key: ${fileKey}`);
      }

      // 2. Parsear el archivo línea por línea
      const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        return { success: true, importedCount: 0, skippedCount: 0, errors: [] };
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const emailIdx = headers.indexOf('Email');
      const firstNameIdx = headers.indexOf('First Name');
      const lastNameIdx = headers.indexOf('Last Name');
      const companyNameIdx = headers.indexOf('Company Name');
      const typeIdx = headers.indexOf('Type');
      const phoneIdx = headers.indexOf('Phone');

      let importedCount = 0;
      let skippedCount = 0;
      const errors: Array<{ row: number; message: string }> = [];

      for (let i = 1; i < lines.length; i++) {
        const rowNum = i + 1;
        const line = lines[i];

        // Parseador simple de CSV que maneja comillas dobles opcionales
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

        const type = typeIdx !== -1 ? values[typeIdx] : 'PERSON';
        const firstName = firstNameIdx !== -1 ? values[firstNameIdx] : '';
        const lastName = lastNameIdx !== -1 ? values[lastNameIdx] : '';
        const companyName = companyNameIdx !== -1 ? values[companyNameIdx] : '';
        const email = emailIdx !== -1 ? values[emailIdx] : '';
        const phone = phoneIdx !== -1 ? values[phoneIdx] : '';

        // Validaciones
        if (!type || (type !== 'PERSON' && type !== 'COMPANY')) {
          errors.push({ row: rowNum, message: `Type must be PERSON or COMPANY (received: "${type}")` });
          skippedCount++;
          continue;
        }

        if (type === 'PERSON' && !firstName) {
          errors.push({ row: rowNum, message: 'First name is required for PERSON contacts' });
          skippedCount++;
          continue;
        }

        if (type === 'COMPANY' && !companyName) {
          errors.push({ row: rowNum, message: 'Company name is required for COMPANY contacts' });
          skippedCount++;
          continue;
        }

        if (email && !email.includes('@')) {
          errors.push({ row: rowNum, message: 'Invalid email format' });
          skippedCount++;
          continue;
        }

        if (email) {
          const duplicate = await this.prisma.contact.findFirst({
            where: { organizationId, email },
          });
          if (duplicate) {
            errors.push({ row: rowNum, message: `Email ${email} is already in use by another contact` });
            skippedCount++;
            continue;
          }
        }

        try {
          await this.prisma.contact.create({
            data: {
              organizationId,
              type,
              firstName: type === 'PERSON' ? firstName : null,
              lastName: type === 'PERSON' ? lastName : null,
              companyName: type === 'COMPANY' ? companyName : null,
              email: email || null,
              phone: phone || null,
            },
          });
          importedCount++;
        } catch (dbErr: any) {
          errors.push({ row: rowNum, message: `Database insert failed: ${dbErr.message}` });
          skippedCount++;
        }
      }

      // 3. Eliminar el archivo temporal de MinIO
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
          }),
        );
      } catch (delErr) {
        this.logger.error(`Failed to delete temporary S3 file ${fileKey}:`, delErr);
      }

      return {
        success: true,
        importedCount,
        skippedCount,
        errors,
      };
    }

    throw new Error(`Unsupported job type: ${job.name}`);
  }
}
