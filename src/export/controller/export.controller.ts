import { Body, Controller, Post } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { PdfService } from '@app/export/services/pdf.service';

@Controller('/article')
export class ExportController {
  constructor(private readonly pdfService: PdfService) { }

  @Post('/pdf')
  public async createPdf(@Body() data: any)
  {
    const result = await this.pdfService.pdfMake(data);

    return { msg: result }
  }

}
