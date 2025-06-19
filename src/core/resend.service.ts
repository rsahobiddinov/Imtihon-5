import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class ResendService extends Resend {
  constructor(apiKey: string) {
    super(apiKey);
  }
}
