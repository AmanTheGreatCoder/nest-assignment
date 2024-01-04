import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const decoded = this.jwtService.verify(token);
        request['user'] = decoded; // Attach the decoded user to the request object
        return true;
      } catch (error) {
        // Handle invalid or expired token
        console.error('Invalid or expired token');
        return false;
      }
    }

    return false;
  }
}
