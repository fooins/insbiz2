# 保险业务接入服务（insbiz2）

这是福保业务倍增阶段用于保险业务接入的服务。克隆自成立初期的 [insbiz](../insbiz) 系统，并根据本阶段 “**稳定、大流量**” 的特点，进行大量 “**高性能&高可用&高扩展**” 的升级改造。

- [改造细节](../../../.github/tree/main/profile/业务倍增/业务倍增阶段系统改造.md)
- [数据库表结构](../../../.github/tree/main/profile/成立初期/sql)
- [REST API 参考文档](./REST-API-reference-latest.md)
- [版本发布记录](./releases)
- [压测记录和报告](./test/performance)

## 目录结构

```
├─ config  // 配置文件目录
├─ releases  // 发布信息目录
│
├─ src  // 源代码目录
│  ├─ components  // 业务组件目录
│  ├─ libraries  // 工具包目录
│  ├─ models  // 数据库表模型目录
│  ├─ scripts  // NPM 脚本目录
│  │
│  ├─ app.js  // 程序主应用实现
│  ├─ router.js  // HTTP 路由实现
│  ├─ server.js  // HTTP 服务实现
│  └─ start.js  // 程序启动入口
│
├─ test  // 测试相关目录
│  ├─ api  // 接口测试目录
│  └─ performance  // 性能测试目录
│
└─ REST-API-reference-latest.md  // REST API 参考文档
```

## 使用说明

1. 准备工作：安装 Node.js(16.x)、MySQL(8.x)、Redis(7.x) 和 Git。
2. 克隆代码：`git clone https://github.com/fooins/insbiz.git`。
3. 更新配置：修改 `./config/development.js` 文件以覆盖默认配置。
4. 安装依赖：`npm install`。
5. 同步模型：`npm run sync-models:dev`。
6. 启动程序：`npm run start:dev`。

## 环境变量

本项目根据 `NODE_ENV` 环境变量来识别当前所处的运行环境类型，用于指导某些程序作出相应的不同的动作，比如日志组件在不同环境下会记录不同级别的日志。启动服务时请务必设置正确的环境变量，特别是生产环境。目前支持以下值：

| 环境变量值  | 说明     |
| ----------- | -------- |
| production  | 生产环境 |
| development | 开发环境 |

## 脚本命令

- `start:dev`：启动开发环境程序服务。主要用于本地开发调试，代码变更后会自动重启。
- `lint`：执行 ESLint 检查并修复可自动修复的错误或警告。
- `test`：执行接口测试。需要先单独启动 HTTP 服务。
- `sync-models:dev`：将所有模型同步到开发环境数据库，已经存在的表会自动根据模型调整为最新的结构。
- `reset-data:dev`：在开发环境数据库中添加样本数据，在此之前会先清空数据并同步所有模型。
