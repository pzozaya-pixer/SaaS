import { Controller, Get, Post, Body, Patch, Param, Delete, Ip, Headers } from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { SubmitFormDto } from './dto/submit-form.dto';
import { ActiveOrg } from '../../common/decorators/active-org.decorator';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  // -------------------------------------------------------------
  // RUTAS PÚBLICAS (No requieren autenticación / x-organization-id)
  // -------------------------------------------------------------

  @Get('public/:token')
  findPublicForm(@Param('token') token: string) {
    return this.formsService.findByToken(token);
  }

  @Post('public/:token/submit')
  submitPublicForm(
    @Param('token') token: string,
    @Body() dto: SubmitFormDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.formsService.submitPublic(token, dto, ipAddress, userAgent);
  }

  // -------------------------------------------------------------
  // RUTAS PRIVADAS (Requieren x-organization-id)
  // -------------------------------------------------------------

  @Post()
  create(@ActiveOrg() orgId: string, @Body() createFormDto: CreateFormDto) {
    return this.formsService.create(orgId, createFormDto);
  }

  @Get()
  findAll(@ActiveOrg() orgId: string) {
    return this.formsService.findAll(orgId);
  }

  @Get(':id')
  findOne(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.formsService.findOne(orgId, id);
  }

  @Patch(':id')
  update(
    @ActiveOrg() orgId: string,
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto,
  ) {
    return this.formsService.update(orgId, id, updateFormDto);
  }

  @Delete(':id')
  remove(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.formsService.remove(orgId, id);
  }

  @Get(':id/submissions')
  findAllSubmissions(@ActiveOrg() orgId: string, @Param('id') id: string) {
    return this.formsService.findAllSubmissions(orgId, id);
  }
}
