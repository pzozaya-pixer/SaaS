import { Module } from '@nestjs/common';
import { CustomEntitiesService } from './custom-entities.service';
import { CustomEntitiesController } from './custom-entities.controller';

@Module({
  controllers: [CustomEntitiesController],
  providers: [CustomEntitiesService],
  exports: [CustomEntitiesService],
})
export class CustomEntitiesModule {}
