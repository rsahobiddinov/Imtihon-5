import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ResendService } from '../resend/resend.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: ResendService,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('RESEND_API_KEY');
        if (!apiKey) {
          throw new Error('RESEND_API_KEY is not set in .env file');
        }
        return new ResendService(apiKey);
      },
      inject: [ConfigService],
    },
  ],
  exports: [ResendService],
})
export class ResendModule {}
