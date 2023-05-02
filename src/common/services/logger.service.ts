import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import { format } from 'winston';
import { DailyRotateFileTransportOptions } from 'winston-daily-rotate-file';
import * as DailyRotateFileTransportInstance from 'winston-daily-rotate-file';
import { env } from '@app/common/utils/env.helper';

const LOG_DIR = 'logs/';

@Injectable()
export class LoggerService {
  public constructor() {
    let alignedWithColorsAndTime = format.combine(
      format.colorize(),
      format.timestamp(),
      format.align(),
      format.printf(info => `[${info.timestamp} ${info.level}] ${info.message}`)
    );
    /*if (LoggerService.isProductionEnv()) {
      alignedWithColorsAndTime = format.combine(
        format.timestamp(),
        format.printf(info => `[${info.timestamp} ${info.level}] ${info.message}`)
      );
    }*/
    const loggingLevels = {
      emerg: 0,
      alert: 1,
      crit: 2,
      error: 3,
      warning: 4,
      notice: 5,
      info: 6,
      debug: 7
    };

    this.instance = winston.createLogger({
      silent: LoggerService.isTestEnv(),
      level: 'debug',
      levels: loggingLevels,
      format: alignedWithColorsAndTime,
      transports: [
        new winston.transports.Console(),
        LoggerService.createRotatorTransport(`${LOG_DIR}/server/%DATE%.log`)
      ]
    });
  }

  private readonly instance: winston.Logger;

  private static createRotatorTransport(filename: string, opts: DailyRotateFileTransportOptions = {}) {
    return new DailyRotateFileTransportInstance(Object.assign({}, {
      filename,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '200m',
      maxFiles: '30d'
    }, opts));
  }

  private static isTestEnv(): boolean {
    return process.env.NODE_ENV === 'test';
  }

  private static isProductionEnv(): boolean {
    return process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';
  }

  public server() {
    return this.getLoggers(this.instance);
  }

  public getLoggers(instance: winston.Logger) {
    return {
      emerg: (message, data?: object) => instance.emerg(JSON.stringify({message, data})),
      emergency: (message, data?: object) => instance.emerg(JSON.stringify({message, data})), // Alias
      alert: (message, data?: object) => instance.alert(JSON.stringify({message, data})),
      crit: (message, data?: object) => instance.crit(JSON.stringify({message, data})),
      critical: (message, data?: object) => instance.crit(JSON.stringify({message, data})), // Alias
      error: (message, data?: object) => instance.error(JSON.stringify({message, data})),
      warning: (message, data?: object) => instance.warning(JSON.stringify({message, data})),
      warn: (message, data?: object) => instance.warning(JSON.stringify({message, data})), // Alias
      notice: (message, data?: object) => instance.notice(JSON.stringify({message, data})),
      info: (message, data?: object) => instance.info(JSON.stringify({message, data})),
      debug: (message, data?: object) => instance.debug(JSON.stringify({message, data})),
      memdump: (key?: string) => env('MEMORY_LOG', false)
        ? instance.info(
          JSON.stringify({
            message: `${key ? `[${key}] ` : ''}Memdump`,
            data: [...Object.keys(process.memoryUsage()).map(k => `${k}: ${Math.round(process.memoryUsage()[k] / 1024 / 1024 * 100) / 100} MB`)]
          })
        )
        : null,
    };
  }
}
