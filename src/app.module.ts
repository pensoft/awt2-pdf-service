import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getEnvPath } from './common/utils/env.helper';
import { CommonModule } from './common/common.module';
import { MainModule } from '@app/main/main.module';
import { EventsModule } from '@app/events/events.module';
import { StorageModule } from '@nick.scalewest/nest-storage';
import { MetricsModule } from '@app/common/metrics/metrics.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppInterceptor } from '@app/common/interceptors/app.interceptor';
import { LoggerService } from '@app/common/services/logger.service';

const envFilePath: string = getEnvPath(`${__dirname}/..`);
const removeProtocol = (url) => {
  if (!url) {
    return '';
  }

  return url.replace(/(^\w+:|^)\/\//, '');
}
@Module({
  imports: [
    ConfigModule.forRoot({envFilePath, isGlobal: true}),
    StorageModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        default: 'pdf',
        disks: {
          pdf: {
            driver: configService.get('STORAGE_DRIVER'),
            bucket: configService.get('STORAGE_BUCKET'),
            region: configService.get('STORAGE_REGION'),
            minioOptions: {
              endPoint: removeProtocol(configService.get('STORAGE_ENDPOINT')),
              accessKey: configService.get('STORAGE_ACCESS_KEY_ID'),
              secretKey: configService.get('STORAGE_SECRET_ACCESS_KEY'),
              region: configService.get('STORAGE_REGION')
            },
            debug: configService.get('STORAGE_DEBUG')
          },
        }
      }),
      inject: [ConfigService],
    }),
    CommonModule,
    EventsModule,
    MainModule,
    MetricsModule,
  ],
  controllers: [],
  providers: [
    LoggerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AppInterceptor
    }
  ],
})
export class AppModule {
}
