type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const colors = {
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  reset: '\x1b[0m'
};

export function createLogger(env: Env) {
  const logLevel = env.LOG_LEVEL?.toLowerCase() as LogLevel || 'info';
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };

  function shouldLog(level: LogLevel): boolean {
    return levels[level] >= levels[logLevel];
  }

  function formatMessage(level: LogLevel, message: any, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const color = colors[level];
    
    let logMessage = '';
    let extraData = '';
    
    if (typeof message === 'object' && message.msg) {
        // 如果传入的是带 msg 的对象
        logMessage = message.msg;
        const { msg, ...rest } = message;
        if (Object.keys(rest).length > 0) {
            extraData = Object.entries(rest)
                .map(([key, value]) => `    ${key}: ${JSON.stringify(value, null, 2)}`)
                .join('\n');
        }
    } else {
        // 处理普通消息
        logMessage = typeof message === 'object' 
            ? JSON.stringify(message, null, 2)
            : message;
    }

    // 处理额外参数
    const formattedArgs = args.length > 0 
        ? '\n' + args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
        ).join('\n')
        : '';

    return `${color}[${timestamp}] ${level.toUpperCase()}: ${logMessage}${colors.reset}${
        extraData ? '\n' + extraData : ''
    }${formattedArgs}`;
  }

  return {
    debug: (message: any, ...args: any[]) => {
      if (shouldLog('debug')) {
        console.debug(formatMessage('debug', message, ...args));
      }
    },
    info: (message: any, ...args: any[]) => {
      if (shouldLog('info')) {
        console.info(formatMessage('info', message, ...args));
      }
    },
    warn: (message: any, ...args: any[]) => {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', message, ...args));
      }
    },
    error: (message: any, ...args: any[]) => {
      if (shouldLog('error')) {
        console.error(formatMessage('error', message, ...args));
      }
    }
  };
}