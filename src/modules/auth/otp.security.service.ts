import { BadRequestException, Injectable } from '@nestjs/common';
import RedisService from 'src/core/database/redis.service';

@Injectable()
export default class OtpSecurityService {
  private maxAttempts = 3;
  private blockDuration = 3600;
  private attemptDuration = 3600;

  constructor(private redisService: RedisService) {}

  async recordFailedOtpAttempt(key: string) {
    const attemptsKey = `otp-attempts:${key}`;

    const exists = await this.redisService.get(attemptsKey);

    if (!exists) {
      await this.redisService.set(attemptsKey, this.attemptDuration, '1');
    } else {
      const current = parseInt(exists, 10);
      await this.redisService.set(attemptsKey, this.attemptDuration, (current + 1).toString());
    }

    const usedAttempts = parseInt(await this.redisService.get(attemptsKey) || '0', 10);
    const leftAttempts = this.maxAttempts - usedAttempts;

    if (leftAttempts <= 0) {
      await this.temporaryBlock(key, usedAttempts);
    }

    return leftAttempts;
  }

  async temporaryBlock(key: string, attempts: number) {
    const date = Date.now();
    const blockKey = `temporary-blocked:${key}`;
    await this.redisService.set(
      blockKey,
      this.blockDuration,
      JSON.stringify({
        blockedAt: date,
        attempts,
        reason: 'Too many attempts',
        unblockedAt: date + this.blockDuration * 1000,
      }),
    );

    await this.redisService.del(`otp-attempts:${key}`);
  }

  async checkIfTemporaryBlockedUser(key: string) {
    const blockKey = `temporary-blocked:${key}`;
    const blockedData = await this.redisService.get(blockKey);
    if (blockedData) {
      const ttl = await this.redisService.ttl(blockKey);
      throw new BadRequestException({
        message: `You tried too many times, please try again after ${ttl} seconds!`,
      });
    }
  }
}
