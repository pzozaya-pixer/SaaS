import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto } from './dto/create-pipeline.dto';
import { CreateStageDto } from './dto/create-stage.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { TransitionStageDto } from './dto/transition-stage.dto';
import { ActiveOrg } from '../../common/decorators/active-org.decorator';

@Controller('pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  // -------------------------------------------------------------
  // PIPELINE DEFINITIONS
  // -------------------------------------------------------------

  @Post()
  createPipeline(@ActiveOrg() orgId: string, @Body() dto: CreatePipelineDto) {
    return this.pipelinesService.createPipeline(orgId, dto);
  }

  @Get()
  findAllPipelines(@ActiveOrg() orgId: string) {
    return this.pipelinesService.findAllPipelines(orgId);
  }

  @Get(':id')
  findOnePipeline(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.pipelinesService.findOnePipeline(orgId, id);
  }

  @Patch(':id')
  updatePipeline(@ActiveOrg() orgId: string, @Param('id') id: string, @Body() dto: any) {
    return this.pipelinesService.updatePipeline(orgId, id, dto);
  }

  @Delete(':id')
  removePipeline(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.pipelinesService.removePipeline(orgId, id);
  }

  // -------------------------------------------------------------
  // PIPELINE STAGES
  // -------------------------------------------------------------

  @Post(':pipelineId/stages')
  createStage(
    @ActiveOrg() orgId: string,
    @Param('pipelineId') pipelineId: string,
    @Body() dto: CreateStageDto,
  ) {
    return this.pipelinesService.createStage(orgId, pipelineId, dto);
  }

  @Get(':pipelineId/stages')
  findAllStages(@ActiveOrg() orgId: string, @Param('pipelineId') pipelineId: string) {
    return this.pipelinesService.findAllStages(orgId, pipelineId);
  }

  @Patch('stages/:id')
  updateStage(@ActiveOrg() orgId: string, @Param('id') id: string, @Body() dto: any) {
    return this.pipelinesService.updateStage(orgId, id, dto);
  }

  @Delete('stages/:id')
  removeStage(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.pipelinesService.removeStage(orgId, id);
  }

  // -------------------------------------------------------------
  // PIPELINE RECORDS (TARJETAS)
  // -------------------------------------------------------------

  @Post(':pipelineId/records')
  createRecord(
    @ActiveOrg() orgId: string,
    @Param('pipelineId') pipelineId: string,
    @Body() dto: CreateRecordDto,
  ) {
    return this.pipelinesService.createRecord(orgId, pipelineId, dto);
  }

  @Get(':pipelineId/records')
  findAllRecords(
    @ActiveOrg() orgId: string,
    @Param('pipelineId') pipelineId: string,
    @Query('stageId') stageId?: string,
  ) {
    return this.pipelinesService.findAllRecords(orgId, pipelineId, stageId);
  }

  @Get('records/:id')
  findOneRecord(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.pipelinesService.findOneRecord(orgId, id);
  }

  @Patch('records/:id')
  updateRecord(@ActiveOrg() orgId: string, @Param('id') id: string, @Body() dto: any) {
    return this.pipelinesService.updateRecord(orgId, id, dto);
  }

  @Delete('records/:id')
  removeRecord(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.pipelinesService.removeRecord(orgId, id);
  }

  @Post('records/:id/transition')
  transitionStage(
    @ActiveOrg() orgId: string,
    @Param('id') id: string,
    @Body() dto: TransitionStageDto,
  ) {
    return this.pipelinesService.transitionStage(orgId, id, dto);
  }
}
