import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RatesController } from './rates.controller';
import { RatesService } from './rates.service';
import { TcmbService } from './tcmb.service';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: false,
    }),
  ],
  controllers: [RatesController],
  providers: [RatesService, TcmbService],
})
export class RatesModule {}
