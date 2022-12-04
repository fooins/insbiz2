# 设置基础镜像
FROM node:16.18.1

# 设置环境变量
ENV NODE_ENV=production

# 设置工作目录
WORKDIR /app

# 拷贝 package.json 和 package-lock.json 文件
COPY ["package.json", "package-lock.json*", "./"]

# 安装依赖项
RUN npm install

# 拷贝源代码
COPY . .

# 启动服务
CMD [ "node", "./src/start.js" ]

# 监听指定的网络端口
EXPOSE 8080
