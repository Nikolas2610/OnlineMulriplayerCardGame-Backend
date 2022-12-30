import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class EmailConfirmationGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { user } = context.switchToHttp().getRequest();

    if (!user?.isEmailConfirmed) {
      throw new UnauthorizedException('Confirm your email first');
    }
    return true;
  }
}
