# Insbiz 2.0.0 发布操作

1. 购买设备（这里用的是腾讯云）。

   - 购买 Kubernetes 托管服务（托管控制平面集群）。
   - 购买镜像仓库服务。
   - 购买 MySQL(8.x) 高可用实例。
   - 购买 Redis(7.x) 集群版实例。

2. 存量数据迁移。

   - MySQL 数据。
   - Redis 数据。

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
