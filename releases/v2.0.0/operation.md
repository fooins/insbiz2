# Insbiz 2.0.0 发布操作

## 部署

1. 购买设备（这里用的是腾讯云）：

   - 购买容器服务（Tencent Kubernetes Engine，TKE）。
   - 购买容器镜像服务（Tencent Container Registry，TCR）。
   - 购买云数据库 MySQL（TencentDB for MySQL）高可用实例。
   - 购买云数据库 Redis（TencentDB for Redis）集群版实例。

2. 设备初始化：

   - 容器服务
     - 创建 insbiz2 集群（Deployment）。
     - 创建 insbiz2 服务（Service）。
     - 开启集群 APIServer 公网访问。
   - MySQL：迁移数据。
   - Redis：迁移数据。

3. 启动 GitHub 流水线 “[部署到生产环境(TKE)](https://github.com/fooins/insbiz2/actions/workflows/deploy-to-prod-tke.yaml)”，需设置 [密钥信息](https://github.com/organizations/fooins/settings/secrets/actions)：

   - INSBIZ2_PRODUCTION_CONFIG: INSBIZ2 生产配置
   - TENCENT_CLOUD_ACCOUNT_ID: 腾讯云账户 ID
   - TENCENT_CLOUD_SECRET_ID: 腾讯云密钥 ID
   - TENCENT_CLOUD_SECRET_KEY: 腾讯云密钥
   - TKE_CLUSTER_ID: TKE 集群唯一标识
   - TKE_KUBE_CONFIG: TKE 连接配置信息
   - TKE_REGION: TKE 所在地域
   - TKE_REGISTRY_PASSWORD: TKE 镜像仓库密码
   - TKE_REGISTRY_SERVER: TKE 镜像仓库地址（包含路径）

## 回滚（若需要）

1. 销毁并退还上述云设备。
