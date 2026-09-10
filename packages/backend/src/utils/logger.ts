enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class Logger {
  private env: string;
  private context?: string;

  constructor(context?: string) {
    this.env = process.env.NODE_ENV || 'development';
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    const contextStr = this.context ? ` [${this.context}]` : '';
    return `[${timestamp}] [${level}]${contextStr} ${message}${dataStr}`;
  }

  public debug(message: string, data?: any): void {
    if (this.env === 'development') {
      console.log(this.formatMessage(LogLevel.DEBUG, message, data));
    }
  }

  public info(message: string, data?: any): void {
    console.log(this.formatMessage(LogLevel.INFO, message, data));
  }

  public warn(message: string, data?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, data));
  }

  public error(message: string, data?: any): void {
    console.error(this.formatMessage(LogLevel.ERROR, message, data));
  }
}

export const logger = new Logger();
