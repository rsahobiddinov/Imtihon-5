import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import RedisService from 'src/core/database/redis.service';
import { generate } from 'otp-generator';
import SmsService from './sms.service';
import OtpSecurityService from './otp.security.service';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  constructor(
    private redisService: RedisService,
    private readonly smsService: SmsService,
    private readonly otpSecurity: OtpSecurityService,
  ) {}

  public generateOtp() {
    return generate(6, {
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
      digits: true,
    });
  }

  public getSessionToken() {
    return crypto.randomUUID();
  }

  async sendOtp(phone_number: string) {
    await this.otpSecurity.checkIfTemporaryBlockedUser(phone_number);

    const key = `user:${phone_number}`;
    await this.checkOtpExisted(key);

    const tempOtp = this.generateOtp();

    const responseRedis = await this.redisService.set(key, 60, tempOtp); 
    if (responseRedis === 'OK') {
      await this.smsService.sendSms(phone_number, tempOtp);
      return true;
    }
    throw new InternalServerErrorException('Failed to send OTP');
  }

  async checkOtpExisted(key: string) {
    const checkOtp = await this.redisService.get(key);
    if (checkOtp) {
      const ttl = await this.redisService.ttl(key);
      throw new BadRequestException(`Please try again after ${ttl} seconds`);
    }
  }

  async verifyOtpSendedUser(phone_number: string, code: string) {
    const key = `user:${phone_number}`;
    await this.otpSecurity.checkIfTemporaryBlockedUser(phone_number);

    const otp = await this.redisService.get(key);
    if (!otp) {
      throw new BadRequestException('You sent an invalid code');
    }

    if (otp !== code) {
      const attempts = await this.otpSecurity.recordFailedOtpAttempt(phone_number);
      throw new BadRequestException({
        message: 'Invalid code',
        attempts: `You have ${attempts} attempts left`,
      });
    }

    await this.redisService.del(key);

    const sessionToken = this.getSessionToken();
    await this.redisService.set(`session_token:${phone_number}`, 600, sessionToken); // 10 мин TTL

    return sessionToken;
  }

  async checkSessionTokenUser(key: string, session_token: string) {
    const token = await this.redisService.get(key);
    if (!token || session_token !== token) {
      throw new InternalServerErrorException('Session token invalid');
    }
  }

  async delSessionTokenUser(key: string) {
    await this.redisService.del(key);
  }
}
