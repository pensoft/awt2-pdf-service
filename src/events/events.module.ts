import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ExportModule } from '@app/export/export.module';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule,
      {
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const url = `amqp://${configService.get('RABBITMQ_USER')}:${configService.get('RABBITMQ_PASSWORD')}@${configService.get('RABBITMQ_HOST')}:${configService.get('RABBITMQ_PORT')}`;
          console.log('RabbitMQ URI: '+url);
          return {
            uri: url,
            exchanges: [],
            connectionManagerOptions: { heartbeatIntervalInSeconds: 60 },
            connectionInitOptions: { wait: true }
          }
        },
        inject: [ConfigService],
      }),
    ExportModule,
  ],
})
export class EventsModule {}
