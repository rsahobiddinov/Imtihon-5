import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export default class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handlerFunction = context.getHandler();
    const handlerClass = context.getClass();
    if (
      this.reflector.getAllAndOverride('isFreeAuth', [
        handlerClass,
        handlerFunction,
      ])
    )
      return true;
    const request = context.switchToHttp().getRequest();
    const token = request.cookies['jwt'];
    try {
      request.user = await this.jwtService.verifyAsync(token);
      return true;
    } catch (error) {
      throw new ForbiddenException('Token is invalid!');
    }
  }
}