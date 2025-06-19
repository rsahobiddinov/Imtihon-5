import { Injectable, Logger } from "@nestjs/common";
import Redis, { Redis as RedisClient } from "ioredis";

@Injectable()
export default class RedisService {
  private readonly logger: Logger = new Logger("Redis");
  public redis: RedisClient;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST as string,
      port: +(process.env.REDIS_PORT as string),
    });

    this.redis.on('connect', () => {
      this.logger.log("Connected!");
    });

    this.redis.on("error", (error) => {
      this.logger.error(error.message);
      this.redis.quit();
    });
  }

  async set(key: string, duration: number, value: string | object) {
    return await this.redis.setex(
      key,
      duration,
      typeof value === "string" ? value : JSON.stringify(value)
    );
  }

  async get(key: string) {
    return await this.redis.get(key);
  }

  async ttl(key: string) {
    return await this.redis.ttl(key);
  }

  async del(key: string) {
    return await this.redis.del(key);
  }
}
