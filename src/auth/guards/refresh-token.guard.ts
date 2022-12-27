import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RefreshToken implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        // Get the user from the request
        const { user } = context.switchToHttp().getRequest();

        console.log(user);
        if (user.refresh_token) {
            return true
        }
    }
}
