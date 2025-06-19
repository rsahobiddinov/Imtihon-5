import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create.dto';
import { Response } from 'express';
import VerifyOtpDto from './dto/verify.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SendCodeLoginDto, VerifyCodeLoginDto } from './dto/login.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body() data: CreateAuthDto) {
    return await this.authService.sendOtpUser(data);
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() data: VerifyOtpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.authService.verifyOtp(data);
  }

@Post('register')
async register(
  @Body() data: CreateAuthDto,
  @Res({ passthrough: true }) res: Response,
) {
  const token = await this.authService.register(data);
    res.cookie('token', token, {
      maxAge: 2 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return { token };
  }

  @Post('login')
  async login(@Body() data: SendCodeLoginDto) {
    return await this.authService.sendCodeLogin(data);
  }

  @Post('login-verify')
  async loginVerify(@Body() data: VerifyCodeLoginDto) {
    return await this.authService.verifyCodeLogin(data);
  }
}
