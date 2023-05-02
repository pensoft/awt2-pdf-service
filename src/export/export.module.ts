import { Module } from '@nestjs/common';
import { ExportController } from '@app/export/controller/export.controller';
import { ExportService } from '@app/export/services/export.service';
import { PdfService } from '@app/export/services/pdf.service';
import { LoggerService } from '@app/common/services/logger.service';

@Module({
  imports: [
  ],
  controllers: [ExportController],
  providers: [
    LoggerService,
    PdfService,
    ExportService,
  ]
})
export class ExportModule {}
