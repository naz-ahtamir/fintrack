// src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * TransformInterceptor
 * Converts Prisma Decimal types to numbers in API responses
 * This ensures JSON responses have proper number types instead of strings
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transformDecimals(data)));
  }

  private transformDecimals(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Handle Prisma Decimal instances
    if (data instanceof Decimal) {
      return data.toNumber();
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.transformDecimals(item));
    }

    // Handle objects
    if (typeof data === 'object') {
      const transformed: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          transformed[key] = this.transformDecimals(data[key]);
        }
      }
      return transformed;
    }

    return data;
  }
}
