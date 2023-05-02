import { Module } from '@nestjs/common';
import { AppController } from '@app/main/controller/app.controller';
import { AppService } from '@app/main/services/app.service';

@Module({
  controllers: [AppController],
  providers: [AppService]
})
export class MainModule {}
