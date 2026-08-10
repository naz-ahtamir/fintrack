import { Injectable, LoggerService as NestLoggerService, LogLevel } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    const ctx = context || this.context || 'Application';
    console.log(`[${new Date().toISOString()}] [LOG] [${ctx}] ${message}`);
  }

  error(message: any, trace?: string, context?: string) {
    const ctx = context || this.context || 'Application';
    console.error(`[${new Date().toISOString()}] [ERROR] [${ctx}] ${message}`);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: any, context?: string) {
    const ctx = context || this.context || 'Application';
    console.warn(`[${new Date().toISOString()}] [WARN] [${ctx}] ${message}`);
  }

  debug(message: any, context?: string) {
    const ctx = context || this.context || 'Application';
    console.debug(`[${new Date().toISOString()}] [DEBUG] [${ctx}] ${message}`);
  }

  verbose(message: any, context?: string) {
    const ctx = context || this.context || 'Application';
    console.log(`[${new Date().toISOString()}] [VERBOSE] [${ctx}] ${message}`);
  }
}
