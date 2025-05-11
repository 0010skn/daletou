# 大乐透预测系统 Docker 使用指南

本文档将指导您如何使用 Docker 运行大乐透预测系统，并正确设置管理员密钥。

## 先决条件

- 安装 [Docker](https://docs.docker.com/get-docker/)
- 安装 [Docker Compose](https://docs.docker.com/compose/install/) (可选，用于使用 docker-compose 方式启动)

## 使用 Docker 运行

### 方法一：使用 Docker Compose

1. **克隆或下载项目代码**

2. **设置管理员密钥**

   有两种方式设置管理员密钥：

   - **在命令行中设置环境变量**：

     ```bash
     export ADMIN_KEY=您的安全密钥
     docker-compose up -d
     ```

   - **创建 .env 文件**：
     ```
     # .env文件内容
     ADMIN_KEY=您的安全密钥
     ```
     然后运行：
     ```bash
     docker-compose up -d
     ```

3. **访问应用**

   应用将在 http://localhost:3000 运行

   管理员面板可以通过 http://localhost:3000/admin-xxxxx 访问（其中 admin-xxxxx 是您应用中配置的路径）

### 方法二：使用 Docker 命令直接运行

1. **构建 Docker 镜像**

   ```bash
   docker build -t daletou-app .
   ```

2. **运行容器（设置管理员密钥）**

   ```bash
   docker run -d \
     -p 3000:3000 \
     -e ADMIN_KEY=您的安全密钥 \
     -v $(pwd)/data:/app/data \
     --name daletou \
     daletou-app
   ```

3. **访问应用**

   应用将在 http://localhost:3000 运行

## 数据持久化

应用数据存储在容器的 `/app/data` 目录中。通过卷挂载，这些数据会被保存在宿主机的 `./data` 目录中：

- `data/pin/` - 存储每日的量子密钥
- `data/ip_records.json` - 存储 IP 记录
- `data/key_price.txt` - 存储密钥价格
- `data/purchase_link.txt` - 存储购买链接

## 环境变量

| 环境变量                | 描述              | 默认值                     |
| ----------------------- | ----------------- | -------------------------- |
| ADMIN_KEY               | 管理员访问密钥    | your_secure_admin_key_here |
| NODE_ENV                | 运行环境          | production                 |
| NEXT_TELEMETRY_DISABLED | 禁用 Next.js 遥测 | 1                          |

## 常见问题

### 如何修改管理员密钥？

您可以停止并重新启动容器，指定新的 ADMIN_KEY 环境变量：

```bash
# 使用 Docker Compose
export ADMIN_KEY=新的安全密钥
docker-compose down
docker-compose up -d

# 或使用 Docker 命令
docker stop daletou
docker rm daletou
docker run -d -p 3000:3000 -e ADMIN_KEY=新的安全密钥 -v $(pwd)/data:/app/data --name daletou daletou-app
```

### 如何备份数据？

所有数据都存储在宿主机的 `./data` 目录中。您可以通过复制该目录来备份数据：

```bash
cp -r ./data ./data_backup_$(date +%Y%m%d)
```

### 如何查看应用日志？

```bash
# 使用 Docker Compose
docker-compose logs -f

# 或使用 Docker 命令
docker logs -f daletou
```

## 安全提示

- 使用强密码作为您的 ADMIN_KEY
- 不要在公共环境中泄露您的管理员密钥
- 定期更换管理员密钥以提高安全性
