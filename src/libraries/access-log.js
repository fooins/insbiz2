const rTracer = require('cls-rtracer');
const winston = require('winston');
require('winston-daily-rotate-file');

// 实例化日志记录器
const logger = require('./logger')('access-log', {
  level: 'info',
  noErrorFile: true,
  consoleNot: true,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      (info) =>
        `${info.timestamp}|${process.pid}|${rTracer.id()}|${info.message}`,
    ),
  ),
});

/**
 * 记录 API 访问日志的中间件
 * @param {object} ctx 请求的上下文
 * @param {function} next 一个用于执行下游中间件的函数
 */
module.exports = async (ctx, next) => {
  // 记录请求日志
  logger.info(
    [
      'Req',
      ctx.ip,
      ctx.method,
      ctx.protocol,
      ctx.url,
      ctx.headers['content-length'] || '',
      ctx.headers['user-agent'] || '',
    ].join('|'),
  );

  const start = Date.now();
  await next().finally(() => {
    // 记录响应日志
    const end = Date.now();
    const cost = end - start;
    logger.info(['Res', ctx.length, ctx.status, `${cost}ms`].join('|'));
  });
};
