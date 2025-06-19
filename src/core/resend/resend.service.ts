import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class ResendService {
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(options: Parameters<Resend['emails']['send']>[0]) {
    return await this.client.emails.send(options);
  }
}
