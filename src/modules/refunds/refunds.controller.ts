import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards,
  UploadedFile, UseInterceptors, Res, DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import * as fs from 'fs'
import { RefundsService } from './refunds.service'
import { CreateRefundDto } from './dto/create-refund.dto'
import { UpdateRefundDto } from './dto/update-refund.dto'
import { CreateSegmentDto } from './dto/create-refund.dto'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { Role, RefundStatus, RefundFileType } from '@prisma/client'
import type { Response } from 'express';

@Controller('refunds')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.AGENT)
export class RefundsController {
  constructor(private readonly refundsService: RefundsService) {}

  @Get('stats')
  getStats() { return this.refundsService.getStats() }

  @Get()
  findAll(
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page:  number,
    @Query('limit', new DefaultValuePipe(15), ParseIntPipe) limit: number,
    @Query('search')  search?:  string,
    @Query('status')  status?:  RefundStatus,
    @Query('airline') airline?: string,
  ) {
    return this.refundsService.findAll({ page, limit, search, status, airline })
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.refundsService.findOne(id) }

  @Post()
  create(@Body() dto: CreateRefundDto) { return this.refundsService.create(dto) }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRefundDto) {
    return this.refundsService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.refundsService.remove(id) }

  // ── Segmentos ──────────────────────────────────────────
  @Post(':id/segments')
  addSegment(@Param('id') id: string, @Body() dto: CreateSegmentDto) {
    return this.refundsService.addSegment(id, dto)
  }

  @Delete(':id/segments/:segmentId')
  removeSegment(@Param('id') id: string, @Param('segmentId') segmentId: string) {
    return this.refundsService.removeSegment(id, segmentId)
  }

  // ── Archivos ───────────────────────────────────────────
  @Post(':id/files')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/refunds',
      filename: (_, file, cb) => cb(null, `${Date.now()}${extname(file.originalname)}`),
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_, file, cb) => {
      const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.webp']
      cb(null, allowed.includes(extname(file.originalname).toLowerCase()))
    },
  }))
  addFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('fileType') fileType: RefundFileType,
  ) {
    return this.refundsService.addFile(id, file, fileType)
  }

  @Delete(':id/files/:fileId')
  removeFile(@Param('id') id: string, @Param('fileId') fileId: string) {
    return this.refundsService.removeFile(id, fileId)
  }

  @Get(':id/files/:fileId/download')
  async downloadFile(
    @Param('id') id: string,
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    const refund = await this.refundsService.findOne(id)
    const file   = refund.files.find(f => f.id === fileId)
    if (!file || !fs.existsSync(file.filePath)) {
      return res.status(404).json({ message: 'Archivo no encontrado' })
    }
    res.download(join(process.cwd(), file.filePath), file.fileName)
  }
}