/**
 * Logger service for production-ready logging
 * Replaces console.log/error with structured logging
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    let log = `[${timestamp}] ${level}: ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      log += ` | ${JSON.stringify(context)}`;
    }
    
    if (error) {
      log += ` | Error: ${error.message}`;
      if (error.stack && this.isDevelopment) {
        log += `\n${error.stack}`;
      }
    }
    
    return log;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error ? {
        message: error.message,
        stack: error.stack,
      } : undefined,
    };

    const formatted = this.formatLog(entry);

    // In development, use console for visibility
    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formatted);
          break;
        case LogLevel.INFO:
          console.info(formatted);
          break;
        case LogLevel.WARN:
          console.warn(formatted);
          break;
        case LogLevel.ERROR:
          console.error(formatted);
          break;
      }
    } else {
      // In production, could send to external service (e.g., Sentry, LogRocket)
      // Example: sendToLoggingService(entry);
      console.log(formatted);
    }

    // Store in session storage for debugging (last 100 entries)
    this.storeLogEntry(entry);
  }

  private storeLogEntry(entry: LogEntry) {
    try {
      const logs = sessionStorage.getItem('app_logs');
      const logArray: LogEntry[] = logs ? JSON.parse(logs) : [];
      
      logArray.push(entry);
      
      // Keep only last 100 entries
      if (logArray.length > 100) {
        logArray.shift();
      }
      
      sessionStorage.setItem('app_logs', JSON.stringify(logArray));
    } catch (e) {
      // Silently fail if storage is unavailable
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  getLogs(): LogEntry[] {
    try {
      const logs = sessionStorage.getItem('app_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (e) {
      return [];
    }
  }

  clearLogs() {
    try {
      sessionStorage.removeItem('app_logs');
    } catch (e) {
      // Silently fail
    }
  }
}

export const logger = new Logger();
