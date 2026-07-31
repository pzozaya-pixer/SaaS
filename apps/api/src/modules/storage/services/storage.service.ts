import { Injectable, OnModuleInit, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LimitsService } from '../../billing/limits.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand, CreateBucketCommand, HeadBucketCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

@Injectable()
export class StorageService implements OnModuleInit {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly limits: LimitsService,
  ) {
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

  async onModuleInit() {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        try {
          await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
        } catch (createErr) {
          // Ignorar si ya se creó en paralelo
        }
      }
    }
  }

  async uploadFile(organizationId: string, entityName: string, file: Express.Multer.File) {
    const fileSize = file.size;
    
    // 1. Validar límite de espacio (storage_bytes)
    await this.limits.checkLimit(organizationId, 'storage_bytes', fileSize);

    // 2. Generar nombre de archivo único
    const fileId = crypto.randomUUID();
    const fileKey = `${organizationId}/${entityName}/${fileId}_${file.originalname}`;

    // 3. Subir archivo a MinIO
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    // 4. Registrar incremento de almacenamiento
    await this.limits.incrementUsage(organizationId, 'storage_bytes', fileSize);

    // 5. Generar presigned URL temporal
    const presignedUrl = await this.getPresignedUrl(fileKey);

    return {
      fileId,
      key: fileKey,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: fileSize,
      url: presignedUrl,
    };
  }

  async getPresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    // URL firmada por 15 minutos (900 segundos)
    return getSignedUrl(this.s3Client, command, { expiresIn: 900 });
  }

  async deleteFile(organizationId: string, key: string, sizeBytes: number) {
    // Evitar fuga de datos/eliminación cruzada entre inquilinos
    if (!key.startsWith(`${organizationId}/`)) {
      throw new ForbiddenException('You do not have access to this file');
    }

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    );

    // Descontar tamaño de UsageRecord
    await this.decrementUsage(organizationId, 'storage_bytes', sizeBytes);

    return { success: true };
  }

  private async decrementUsage(organizationId: string, metric: string, value: number) {
    const usage = await this.prisma.usageRecord.findUnique({
      where: {
        organizationId_metric: {
          organizationId,
          metric,
        },
      },
    });

    if (usage) {
      const newValue = Number(usage.value) - value;
      await this.prisma.usageRecord.update({
        where: {
          organizationId_metric: {
            organizationId,
            metric,
          },
        },
        data: {
          value: newValue < 0 ? 0 : newValue,
        },
      });
    }
  }
}
