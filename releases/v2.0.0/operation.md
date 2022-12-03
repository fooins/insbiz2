# Insbiz 2.0.0 发布操作

1. 购买设备（这里用的是腾讯云）

   - 购买容器服务（Tencent Kubernetes Engine，TKE）。
   - 购买容器镜像服务（Tencent Container Registry，TCR）。
   - 购买云数据库 MySQL（TencentDB for MySQL）高可用实例。
   - 购买云数据库 Redis（TencentDB for Redis）集群版实例。

2. 设备初始化

   - 容器服务
     - 创建 insbiz2 集群（Deployment）。
     - 创建 insbiz2 服务（Service）。
   - 容器镜像服务
     - 创建命名空间 fooins。
     - 创建镜像仓库 fooins-registry。
   - MySQL
     - 迁移数据。
   - Redis
     - 迁移数据。

3. 设置 [GitHub 密钥](https://github.com/organizations/fooins/settings/secrets/actions)。

   - TENCENT_CLOUD_ACCOUNT_ID: 腾讯云账户 ID
   - TENCENT_CLOUD_SECRET_ID: 腾讯云密钥 ID
   - TENCENT_CLOUD_SECRET_KEY: 腾讯云密钥
   - TKE_REGISTRY_SERVER: TKE 镜像仓库地址（包含路径）
   - TKE_REGISTRY_PASSWORD: TKE 镜像仓库密码
   - TKE_REGION: TKE 所在地域
   - TKE_CLUSTER_ID: TKE 集群唯一标识
   - INSBIZ2_PRODUCTION_CONFIG: INSBIZ2 生产配置

4. 启动流水线 “[部署到生产环境（TKE）](https://github.com/fooins/insbiz2/actions/workflows/deploy-to-prod-tke.yaml)”。

5. 回滚（若需要）。

   - 销毁并退还上述云设备。
