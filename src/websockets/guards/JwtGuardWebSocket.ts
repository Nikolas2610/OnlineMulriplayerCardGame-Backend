import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtStrategy } from 'src/auth/guards/jwt.strategy';

@Injectable()
export class JwtGuardWebSocket implements NestInterceptor {
  constructor(private readonly jwtStrategy: JwtStrategy) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const client = context.switchToWs().getClient();
    const auth = client.handshake.auth;
    const token = this.extractJwtToken(auth);

    if (!token) {
      throw new WsException('Unauthorized');
    }

    const payload = await this.jwtStrategy.validate({ token });
    
    if (!payload) {
      throw new WsException('Unauthorized');
    }

    return next.handle();
  }

  private extractJwtToken(headers: any): string | undefined {
    const authHeader = headers.authorization;
    console.log(authHeader);
    
    if (!authHeader) {
      return undefined;
    }

    const [, token] = authHeader.split(' ');
    console.log(token);
    
    return token;
  }
}
