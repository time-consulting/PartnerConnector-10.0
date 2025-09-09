import winston from 'winston';
import rfs from 'rotating-file-stream';
import path from 'path';
import { Request, Response } from 'express';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');

// Create rotating file stream
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: logsDir,
  maxFiles: 30, // keep 30 days
  compress: 'gzip'
});

const errorLogStream = rfs.createStream('error.log', {
  interval: '1d',
  path: logsDir,
  maxFiles: 30,
  compress: 'gzip'
});

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta
    });
  })
);

// Create Winston logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'partner-connector',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport (visible in Replit)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File transports for structured logs
    new winston.transports.Stream({
      stream: accessLogStream,
      level: 'info'
    }),
    
    new winston.transports.Stream({
      stream: errorLogStream,
      level: 'error'
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.Console(),
    new winston.transports.Stream({ stream: errorLogStream })
  ],
  
  // Handle unhandled rejections
  rejectionHandlers: [
    new winston.transports.Console(),
    new winston.transports.Stream({ stream: errorLogStream })
  ]
});

// Request logger interface
export interface LogContext {
  requestId: string;
  userId?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  userAgent?: string;
  ip?: string;
  error?: Error;
  metadata?: Record<string, any>;
}

// Structured logging functions
export const logRequest = (context: LogContext) => {
  logger.info('HTTP Request', {
    requestId: context.requestId,
    userId: context.userId,
    route: context.route,
    method: context.method,
    statusCode: context.statusCode,
    duration: context.duration,
    userAgent: context.userAgent,
    ip: context.ip,
    metadata: context.metadata
  });
};

export const logError = (context: LogContext, error: Error) => {
  logger.error('HTTP Error', {
    requestId: context.requestId,
    userId: context.userId,
    route: context.route,
    method: context.method,
    statusCode: context.statusCode,
    duration: context.duration,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    metadata: context.metadata
  });
};

export const logAudit = (action: string, actorUserId: string, entityType: string, entityId?: string, metadata?: Record<string, any>) => {
  logger.info('Audit Event', {
    action,
    actorUserId,
    entityType,
    entityId,
    metadata,
    timestamp: new Date().toISOString()
  });
};

// Performance metrics storage
export const metrics = {
  requests: {
    total: 0,
    errors: 0,
    latencies: [] as number[]
  },
  
  reset: () => {
    metrics.requests.total = 0;
    metrics.requests.errors = 0;
    metrics.requests.latencies = [];
  },
  
  addRequest: (duration: number, isError: boolean = false) => {
    metrics.requests.total++;
    if (isError) metrics.requests.errors++;
    metrics.requests.latencies.push(duration);
    
    // Keep only last 1000 latencies for memory efficiency
    if (metrics.requests.latencies.length > 1000) {
      metrics.requests.latencies = metrics.requests.latencies.slice(-1000);
    }
  },
  
  getP95Latency: () => {
    if (metrics.requests.latencies.length === 0) return 0;
    const sorted = [...metrics.requests.latencies].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * 0.95) - 1;
    return sorted[index] || 0;
  },
  
  getErrorRate: () => {
    if (metrics.requests.total === 0) return 0;
    return (metrics.requests.errors / metrics.requests.total) * 100;
  }
};