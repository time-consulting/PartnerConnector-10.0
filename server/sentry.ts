import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { logger } from "./logger";

// Initialize Sentry
export function initSentry() {
  if (!process.env.SENTRY_DSN) {
    logger.warn('SENTRY_DSN not configured - Sentry error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    integrations: [
      nodeProfilingIntegration(),
      
      // HTTP integration for tracking requests
      new Sentry.Integrations.Http({ 
        tracing: true,
        breadcrumbs: true 
      }),
      
      // Express integration
      new Sentry.Integrations.Express(),
      
      // Console integration
      new Sentry.Integrations.Console(),
    ],
    
    // Release tracking
    release: process.env.npm_package_version || 'unknown',
    
    // Filter out irrelevant errors
    beforeSend(event, hint) {
      // Don't send health check errors
      if (event.request?.url?.includes('/healthz') || event.request?.url?.includes('/readyz')) {
        return null;
      }
      
      // Filter out specific error types that are expected
      const error = hint.originalException;
      if (error instanceof Error) {
        // Don't send authentication errors (expected in normal flow)
        if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          return null;
        }
        
        // Don't send validation errors (user input errors)
        if (error.message.includes('validation') || error.message.includes('Invalid input')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Add custom context
    initialScope: {
      tags: {
        component: 'partner-connector',
        service: 'backend'
      }
    }
  });

  logger.info('Sentry error tracking initialized', {
    environment: process.env.NODE_ENV,
    release: process.env.npm_package_version
  });
}

// Helper functions for manual error reporting
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
      Sentry.captureMessage(message, level);
    });
  } else {
    Sentry.captureMessage(message, level);
  }
}

export function setUserContext(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email: email
  });
}

export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    timestamp: Date.now() / 1000
  });
}

// Express middleware
export const sentryRequestHandler = Sentry.Handlers.requestHandler();
export const sentryTracingHandler = Sentry.Handlers.tracingHandler();
export const sentryErrorHandler = Sentry.Handlers.errorHandler();

export { Sentry };