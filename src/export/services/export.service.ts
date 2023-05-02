import { Injectable } from '@nestjs/common';
import { RabbitRPC, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ConsumeMessage, Channel } from 'amqplib'
import { serialize } from 'php-serialize';
import { PdfService } from '@app/export/services/pdf.service';

function myErrorHandler(channel: Channel, msg: ConsumeMessage, error: any) {
  console.error('RabbitSubscribe error', {
    channel,
    msg,
    error,
  })
}

@Injectable()
export class ExportService {
  constructor(
    // other module services if needs to be injected
    private readonly pdfService: PdfService
  ) {
  }

  @RabbitRPC({
    exchange: 'pdf.service',
    routingKey: 'pdf.event.export', // up to you
    queue: 'pdf-service-queue',
    errorHandler: myErrorHandler
  })
  public async onQueueConsumption(msg: any, amqpMsg: ConsumeMessage, channel: Channel) {

    let result = {};
    try {
      const pdfData = await this.pdfService.pdfMake(msg.data);
      console.log('---------------- DONE ---------------');
      return {
        status: 'DONE',
        data: pdfData
      };
    } catch (error) {
      console.log('---------------- ERROR ---------------', error);
      return {
        status: 'FAILED',
        error: error.message,
        data: {
          article_title: msg.data.articleTitle
        }
      }
    }
  }


}
