// 本工具扩展自 winston（https://github.com/winstonjs/winston）
//
// 本工具使用一套适用于本工程的默认配置来初始化每个日志记录器（logger），
// 最终返回一个原始的 winston 日志记录器对象，
// 你也可以使用 winston 原有的能力对其进行自定义配置，比如 `logger.configure({ ... })`。

const path = require('path');
const rTracer = require('cls-rtracer');
const winston = require('winston');
require('winston-daily-rotate-file');
const env = require('./env');

// 日志存储的目录
const dirname = path.join(__dirname, '../../logs/');

/**
 * 生成日志级别
 */
const genLevel = (name, options = {}) => {
  let level;
  if (env.isProd()) {
    level = options.levelProd || 'warn';
  } else {
    level = options.levelNotProd || 'silly';
  }
  return level;
};

/**
 * 生成日志传输方式
 */
const genTransports = (name, options = {}) => {
  const transports = [];

  // 所有级别的日志记录到一个统一的文件中
  // 按照日期滚动
  if (!options.noUniFile) {
    transports.push(
      new winston.transports.DailyRotateFile({
        dirname, // 存储的目录
        filename: `${name}-%DATE%`, // 文件名
        datePattern: 'YYYY-MM-DD', // 文件名中的日期格式
        zippedArchive: true, // 是否开启压缩（除当前日志文件之外的文件）
        maxSize: '100m', // 文件最大大小，超过之后会自动滚动为多个文件
        maxFiles: '14d', // 最多保留多少天的日志文件，超过的会被删除（不加“d”的话则是最多保留多少个文件）
        extension: '.log', // 文件后缀
      }),
    );
  }

  // 错误级别的日志单独再记录一份，以便处理
  // 按大小滚动
  if (!options.noErrorFile) {
    transports.push(
      new winston.transports.File({
        dirname, // 存储的目录
        level: 'error', // 适用的日志级别
        filename: `${name}-error.log`, // 文件名
        tailable: true, // 是否开启滚动
        maxsize: 1024 * 100, // 文件最大大小（字节）
        maxFiles: 10, // 最多保留多少个日志文件，超过的会被删除
      }),
    );
  }

  // 打印到控制台
  let isConsole = !env.isProd();
  const { consoleNot, consoleAll, consoleProd, consoleNotProd } = options;
  if (consoleAll) isConsole = true;
  else if (consoleNot) isConsole = false;
  else if (consoleProd) isConsole = env.isProd();
  else if (consoleNotProd) isConsole = !env.isProd();
  if (isConsole) {
    transports.push(new winston.transports.Console());
  }

  return transports;
};

/**
 * 生成日志内容格式
 */
const genFormat = (name, options = {}) => {
  const formats = [];

  // 记录时间
  if (!options.noFormatTimestamp) {
    formats.push(winston.format.timestamp());
  }

  // 记录错误信息
  if (!options.noFormatErrors) {
    formats.push(winston.format.errors({ stack: true }));
  }

  // 记录自定义信息
  if (!options.noFormatCustom) {
    // 自定义格式
    const custom = winston.format((info) => {
      // 跟踪标识
      // eslint-disable-next-line no-param-reassign
      info.tid = rTracer.id();

      // 进程ID
      // eslint-disable-next-line no-param-reassign
      info.pid = process.pid;

      return info;
    });
    formats.push(custom());
  }

  // 采用JSON格式
  if (!options.noFormatJson) {
    formats.push(winston.format.json());
  }

  // 自定义的格式
  if (options.formats) {
    formats.push(...options.formats);
  }

  return winston.format.combine(...formats);
};

/**
 * 获取日志记录器。
 * @param {string} name 记录器名称
 * @param {object} options 可覆盖创建 winston 记录器时传入的选项，以及其他控制项
 * @returns winston 日志记录器对象
 */
module.exports = function getLogger(name, options = {}) {
  if (!winston.loggers.has(name)) {
    // 创建日志记录器并缓存
    winston.loggers.add(name, {
      level: genLevel(name, options),
      transports: genTransports(name, options),
      format: genFormat(name, options),
      ...options,
    });
  }

  return winston.loggers.get(name);
};
