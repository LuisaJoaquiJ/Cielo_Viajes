import { Controller, Post, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  // ✅ ruta que faltaba — usada por leadsApi.list
  @Get()
  list(
    @Query('page')   page:   string = '1',
    @Query('limit')  limit:  string = '10',
    @Query('status') status?: string,
  ) {
    return this.leadsService.adminList({
      page:   Number(page),
      limit:  Number(limit),
      status,
    });
  }

  // ruta admin — usada por leadsApi.adminList
  @Get('admin/all')
  adminList(
    @Query('page')   page:   string = '1',
    @Query('limit')  limit:  string = '10',
    @Query('status') status?: string,
  ) {
    return this.leadsService.adminList({
      page:   Number(page),
      limit:  Number(limit),
      status,
    });
  }

  @Patch(':id')
updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
  return this.leadsService.updateStatus(id, body.status);
}
}