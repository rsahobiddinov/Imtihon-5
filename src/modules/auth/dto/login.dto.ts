import { IsString } from 'class-validator';

export class SendCodeLoginDto {
  @IsString()
  phone_number: string;

  @IsString()
  password: string;
}

export class VerifyCodeLoginDto {
  @IsString()
  code: string;

  @IsString()
  phone_number: string;
}
