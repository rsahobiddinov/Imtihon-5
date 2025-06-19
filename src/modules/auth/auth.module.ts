import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { OtpService } from './otp.service';
import  SmsService  from './sms.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import  OtpSecurity  from './otp.security.service';
import { EmailOtpService } from './email.service';
import { ResendModule } from 'src/core/resend/resend.module';  

@Module({
  imports: [
    forwardRef(() => UsersModule),
    ResendModule, 
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    SmsService,
    UsersService,
    OtpSecurity,
    EmailOtpService,
  ],
  exports: [EmailOtpService],
})
export class AuthModule {}
