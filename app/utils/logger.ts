import pino from 'pino';

// 创建一个自定义的写入流，将日志输出到 console
//create a custom write stream to output logs to console
const customWriteStream = {
  write: (msg: string) => {
    console.log(JSON.parse(msg));
  },
};

// 创建 Pino logger 实例
//create a Pino logger instance
const logger = pino({
  level: 'info',
  base: undefined,
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  messageKey: 'message',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard',
    },
  },
}, customWriteStream);

export default logger;