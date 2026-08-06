import { Injectable } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

/**
 * JWT Auth Guard using Passport JWT Strategy
 * This guard validates JWT tokens from the Authorization header
 * and attaches the decoded user info to the request object
 */
@Injectable()
export class JwtAuthGuard extends PassportAuthGuard('jwt') {}

/**
 * Alias for backward compatibility
 * Some controllers might still reference AuthGuard
 */
export { JwtAuthGuard as AuthGuard };