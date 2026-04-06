import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AppLogger } from '../utils/logger.util';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new AppLogger(ApiKeyGuard.name);

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const method = request.method;
    const path = request.url;

    if (!apiKey) {
      this.logger.warn(`${method} ${path} için API anahtarı eksik`);
      throw new UnauthorizedException('API key is required');
    }

    const validApiKeys = this.configService
      .get<string>('API_KEYS', '')
      .split(',')
      .map((key: string) => key.trim())
      .filter((key: string) => key.length > 0);

    if (!validApiKeys.includes(apiKey)) {
      this.logger.warn(`${method} ${path} için geçersiz API anahtarı kullanıldı`);
      throw new UnauthorizedException('Invalid API key');
    }

    this.logger.debug(`${method} ${path} için API anahtarı doğrulandı`);
    return true;
  }
}
