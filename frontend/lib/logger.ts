/**
 * Logger utility for consistent error handling
 * In production, these could be sent to a logging service
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogEntry {
    level: LogLevel
    message: string
    context?: string
    error?: unknown
    timestamp: string
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development'

    private log(level: LogLevel, message: string, context?: string, error?: unknown) {
        const entry: LogEntry = {
            level,
            message,
            context,
            error,
            timestamp: new Date().toISOString(),
        }

        // In development, log to console
        if (this.isDevelopment) {
            const contextStr = context ? `[${context}]` : ''
            switch (level) {
                case 'error':
                    console.error(`${contextStr} ${message}`, error || '')
                    break
                case 'warn':
                    console.warn(`${contextStr} ${message}`, error || '')
                    break
                case 'info':
                    console.info(`${contextStr} ${message}`)
                    break
                case 'debug':
                    console.log(`${contextStr} ${message}`)
                    break
            }
        }

        // In production, send to logging service
        // Example: sendToLogService(entry)
    }

    error(message: string, context?: string, error?: unknown) {
        this.log('error', message, context, error)
    }

    warn(message: string, context?: string) {
        this.log('warn', message, context)
    }

    info(message: string, context?: string) {
        this.log('info', message, context)
    }

    debug(message: string, context?: string) {
        this.log('debug', message, context)
    }
}

export const logger = new Logger()
