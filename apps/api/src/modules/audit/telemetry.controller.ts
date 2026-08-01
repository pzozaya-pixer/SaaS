import { Controller, Get } from '@nestjs/common';

@Controller('telemetry')
export class TelemetryController {
  @Get('health')
  getHealth() {
    const memoryUsage = process.memoryUsage();
    // Simular telemetría del sistema en base a procesos activos
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memory: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      },
      latency: {
        p50: '12ms',
        p90: '45ms',
        p99: '110ms',
      },
      worker: {
        status: 'active',
        activeJobs: 0,
        completedJobs: 142,
        failedJobs: 3,
      },
      db: {
        status: 'connected',
        activeConnections: 4,
      },
    };
  }
}
