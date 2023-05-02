import { Module } from '@nestjs/common';
import { LoggerService } from '@app/common/services/logger.service';

@Module({
  providers: [
    LoggerService
  ]
})
export class CommonModule {}
