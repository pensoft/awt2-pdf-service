import { Injectable } from '@nestjs/common';
import { Storage } from '@nick.scalewest/nest-storage'
import { v4 } from "uuid";
import { PdfMakeErrorException } from '@app/export/exceptions/pdf-make-error.exception';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { RpcException } from '@nestjs/microservices';
import { LoggerService } from '@app/common/services/logger.service';

const {pdfmakeJSONparser} = require('../../common/utils/print/pdf/parseHTMLtoPDFmake')
const {renderPdf} = require('../../common/utils/print/pdf/index')

@Injectable()
export class PdfService {
  private expireInMinutes: number = 60*24*7;

  constructor(private readonly configService: ConfigService,
              private readonly loggerService: LoggerService) {
  }

  public async pdfMake(data) {

    try {
      this.loggerService.server().info('START pdfMake');
      let pdfmakeParser = new pdfmakeJSONparser(data);
      this.loggerService.server().info('START pdfmakeParser.refreshContent');

      const pdfDataobject = await pdfmakeParser.refreshContent();

      this.loggerService.server().info('END pdfmakeParser.refreshContent');
      const pdfMetaData = pdfDataobject.pdfMetaData;
      const pdfData = pdfDataobject.pdfData;
      this.loggerService.server().info('START renderPdf');
      const pdf = await renderPdf(pdfData, pdfMetaData);
      //pdf.pipe(fs.createWriteStream('asd.pdf'));
      pdf.end();
      this.loggerService.server().info('END renderPdf');
      const fileName = `${this.configService.get('STORAGE_PATH')}/${v4()}.pdf`;
      this.loggerService.server().info('ADD FILE '+fileName);
      const result =  await Storage.disk('pdf').put(fileName, pdf);
      this.loggerService.server().info('FILE IS STORED');
      this.loggerService.server().info('CREATE LINK');
      const url = await Storage.disk('pdf').signedUrl(result.path, this.expireInMinutes);
      this.loggerService.server().info('LINK IS CREATED', { url });
      return {
        url,
        expire_at: moment().add(this.expireInMinutes, 'm', ),
        ...(data.articleId? {article_id: data.articleId} : {}),
        ...(data.articleTitle? {article_title: data.articleTitle} : {}),
      };
    } catch (error) {
      this.loggerService.server().error('ERROR', error);
      throw new RpcException({
        code: 500, // some number code
        message: JSON.stringify(error.message), // some string value
      });
    }
  }

}
