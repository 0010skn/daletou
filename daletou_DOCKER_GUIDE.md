# daletou Docker 指南

本文档将指导您如何使用 Docker 来构建和运行 "daletou" 项目。

## 目录

- [理解 Dockerfile](#理解-dockerfile)
- [使用 Dockerfile 构建镜像](#使用-dockerfile-构建镜像)
- [理解 docker-compose.yml](#理解-docker-composeyml)
- [使用 docker-compose 管理应用](#使用-docker-compose-管理应用)
- [重要配置](#重要配置)
  - [端口映射](#端口映射)
  - [卷挂载](#卷挂载)
  - [环境变量](#环境变量)

## 理解 Dockerfile

[`Dockerfile`](./Dockerfile:1) 是一个文本文件，包含了一系列用户可以调用在命令行上以组装镜像的指令。以下是本项目 [`Dockerfile`](./Dockerfile:1) 中关键指令的解释：

- **`FROM node:20-alpine AS builder`** (第 2 行) 和 **`FROM node:20-alpine`** (第 27 行):
  - 这利用了 Docker 的多阶段构建（multi-stage builds）特性。
  - 第一阶段（`AS builder`）使用 `node:20-alpine` 作为基础镜像，这是一个轻量级的 Node.js 运行环境，用于构建 Next.js 应用。此阶段包含了所有构建时依赖和源代码。
  - 第二阶段同样使用 `node:20-alpine` 作为生产环境的基础镜像。它仅从构建器阶段复制必要的构建产物，从而显著减小最终镜像的体积，并提高安全性。
- **`WORKDIR /app`** (第 5 行, 第 30 行):
  - 设置后续 `RUN`, `CMD`, `ENTRYPOINT`, `COPY`, `ADD` 指令的工作目录。如果目录不存在，它将被创建。在这里，它将工作目录设置为容器内的 `/app`。
- **`COPY package.json ./`** (第 8 行), **`COPY package-lock.json ./`** (第 9 行):
  - 将项目的 `package.json` 和 `package-lock.json` 文件从宿主机复制到镜像的当前工作目录 (`/app`)。这样做是为了利用 Docker 的层缓存机制，只有当这些文件发生变化时，后续的 `npm install` 步骤才会重新执行。
- **`RUN npm install`** (第 14 行):
  - 在镜像内执行 `npm install` 命令，根据 `package.json` 和 `package-lock.json` 安装项目依赖。
- **`COPY . .`** (第 19 行):
  - 将宿主机当前目录（构建上下文）中的所有剩余文件和文件夹复制到镜像的当前工作目录 (`/app`)。这通常在安装完依赖之后进行，以确保所有源代码和静态资源都被包含在内。
- **`RUN npm run build`** (第 22 行):
  - 执行 `package.json` 中定义的 `build` 脚本（通常是 `next build`），编译 Next.js 应用，生成生产环境所需的优化过的静态文件和代码。
- **`COPY --from=builder /app/.next ./.next`** (第 38 行) 等 `COPY --from=builder` 指令:
  - 这些指令用于从之前的构建器阶段 (`builder`) 选择性地复制构建产物到当前的生产镜像阶段。例如，`/app/.next` 包含了 Next.js 的构建输出，`/app/public` 包含了公共静态资源。
- **`EXPOSE 3000`** (第 46 行):
  - 声明容器在运行时会监听指定的网络端口（这里是 `3000`）。这主要是一个文档性指令，实际上并不会发布端口。实际的端口发布是在运行容器时（例如使用 `docker run -p` 或在 `docker-compose.yml` 中）进行的。
- **`CMD ["npm", "start"]`** (第 50 行):
  - 指定容器启动时默认执行的命令。这里是 `npm start`，它会根据 `package.json` 中的 `start` 脚本（通常是 `next start`）来启动 Next.js 应用的生产服务器。一个 [`Dockerfile`](./Dockerfile:1) 中只能有一个 `CMD` 指令。如果用户在启动容器时指定了其他命令，则此 `CMD` 会被覆盖。

## 使用 Dockerfile 构建镜像

您可以使用项目根目录下的 [`Dockerfile`](./Dockerfile:1) 来构建 Docker 镜像。

1.  **打开终端**：在项目根目录下打开您的终端或命令行工具。
2.  **执行构建命令**：运行以下命令来构建 Docker 镜像。建议为您的镜像指定一个有意义的名称和标签，例如 `daletou-app:latest`。

    ```bash
    docker build -t daletou-app:latest .
    ```

    - `-t daletou-app:latest`：为镜像指定名称 (`daletou-app`) 和标签 (`latest`)。
    - `.`：表示 [`Dockerfile`](./Dockerfile:1) 所在的上下文路径（当前目录）。Docker 守护进程会将此路径下的所有文件发送到构建器。

3.  **验证镜像**：构建完成后，您可以运行以下命令查看已构建的镜像：

    ```bash
    docker images
    ```

    您应该能在列表中看到 `daletou-app` 这个镜像。

## 理解 docker-compose.yml

[`docker-compose.yml`](./docker-compose.yml:1) 文件用于定义和运行多容器 Docker 应用程序。对于 "daletou" 项目，它简化了单个服务的管理。以下是关键配置的解释：

- **`version: "3.8"`** (第 1 行):
  - 指定 `docker-compose` 文件格式的版本。
- **`services:`** (第 3 行):
  - 定义应用包含的各个服务。
- **`next-app:`** (第 4 行):
  - 定义了一个名为 `next-app` 的服务。这是我们 "daletou" 应用的容器。
  - **`build:`** (第 5 行):
    - 指示 `docker-compose` 从 [`Dockerfile`](./Dockerfile:1) 构建镜像。
    - **`context: .`** (第 6 行): 指定构建上下文的路径，即 [`Dockerfile`](./Dockerfile:1) 所在的目录（项目根目录）。
    - **`dockerfile: Dockerfile`** (第 7 行): 指定用于构建的 [`Dockerfile`](./Dockerfile:1) 文件名。
  - **`ports:`** (第 8 行):
    - **`- "3000:3000"`** (第 9 行): 将容器的 `3000` 端口映射到主机的 `3000` 端口。格式是 `"HOST:CONTAINER"`。这意味着您可以通过访问主机的 `3000` 端口来访问容器内运行在 `3000` 端口的应用。
  - **`volumes:`** (第 10 行):
    - **`- ./data:/app/data`** (第 11 行): 将主机上的 `./data` 目录挂载到容器内的 `/app/data` 目录。这允许数据持久化，即使容器停止或删除，`./data` 目录中的数据依然存在。同时，主机和容器可以共享此目录下的文件。
  - **`environment:`** (第 13 行, 注释状态):
    - 用于向容器传递环境变量。例如，可以设置 `NODE_ENV: production`。这些变量可以在应用代码中访问。
  - **`restart: unless-stopped`** (第 16 行):
    - 定义容器的重启策略。`unless-stopped` 表示除非容器被显式停止，否则在退出时总是尝试重启。这有助于确保应用的持续可用性。

## 使用 docker-compose 管理应用

项目根目录下的 [`docker-compose.yml`](./docker-compose.yml:1) 文件可以帮助您更轻松地管理应用的容器。

1.  **启动应用**：在项目根目录下，运行以下命令来构建（如果尚未构建或有更改）并启动应用容器。使用 `-p daletou` 为本次 `docker-compose` 会话创建的资源（如容器、网络）指定一个项目名称，有助于隔离和管理。

    ```bash
    docker-compose -p daletou up -d
    ```

    - `-p daletou`: 设置项目名称为 "daletou"。
    - `-d`：表示在后台（detached mode）运行容器。

2.  **查看容器状态**：您可以使用以下命令查看由 `docker-compose` 管理的、属于 "daletou" 项目的正在运行的容器：

    ```bash
    docker-compose -p daletou ps
    ```

3.  **查看应用日志**：要查看 `next-app` 服务的实时日志，请运行：

    ```bash
    docker-compose -p daletou logs -f next-app
    ```

    其中 `next-app` 是在 [`docker-compose.yml`](./docker-compose.yml:4) 中定义的服务名称。按 `Ctrl+C` 停止查看日志。

4.  **停止应用**：要停止并移除由 `docker-compose` 为 "daletou" 项目创建的容器、网络和匿名卷，请运行：

    ```bash
    docker-compose -p daletou down
    ```

    如果您只想停止容器而不移除它们，可以使用 `docker-compose -p daletou stop`。

5.  **重新构建并启动**：如果您更改了 [`Dockerfile`](./Dockerfile:1) 或应用代码，并且想要重新构建镜像并启动容器，可以运行：
    ```bash
    docker-compose -p daletou up -d --build
    ```

## 重要配置

### 端口映射

在 [`docker-compose.yml`](./docker-compose.yml:1) 文件中，`next-app` 服务的端口映射配置如下：

```yaml
services:
  next-app:
    ports:
      - "3000:3000"
```

这表示容器内部运行在 `3000` 端口的 "daletou" 应用程序将被映射到主机的 `3000` 端口。您可以通过在浏览器中访问 `http://localhost:3000` 来访问该应用。

[`Dockerfile`](./Dockerfile:1) 中的 `EXPOSE 3000` (第 46 行) 指令声明了容器将监听 `3000` 端口，这是一种文档化约定，实际的端口发布由 `docker-compose.yml` 或 `docker run` 命令完成。

### 卷挂载

[`docker-compose.yml`](./docker-compose.yml:1) 文件中为 `next-app` 服务定义了一个卷挂载：

```yaml
services:
  next-app:
    volumes:
      - ./data:/app/data
```

这将主机项目根目录下的 `./data` 目录挂载到容器内的 `/app/data` 目录。这意味着：

- 容器内应用写入到 `/app/data` 的数据将持久化存储在主机上的 `./data` 目录中，即使容器被删除，数据也不会丢失。
- 主机上 `./data` 目录中的更改会实时反映到容器内的 `/app/data` 目录，反之亦然（取决于具体的文件系统事件和配置）。这对于开发过程中需要持久化数据或在容器和主机间共享配置文件非常有用。

### 环境变量

您可以通过以下方式为 "daletou" 应用程序配置环境变量：

1.  **通过 `docker-compose.yml`**：
    在 [`docker-compose.yml`](./docker-compose.yml:1) 文件中，您可以取消注释并修改 `next-app` 服务下的 `environment` 部分来设置环境变量：

    ```yaml
    services:
      next-app:
        # ... 其他配置 ...
        environment:
          - NODE_ENV=production
          - MY_API_KEY=your_api_key_here # 示例：替换为实际需要的键值
          # 为 daletou 项目添加更多特定的环境变量
    ```

    这是推荐的为特定服务配置环境变量的方式，尤其是对于非敏感的配置。

2.  **通过 `.env` 文件**：
    `docker-compose` 默认会加载项目根目录下名为 `.env` 的文件中的环境变量。您可以在该文件中定义变量，例如：

    ```env
    # .env 文件内容示例
    NODE_ENV=production
    MY_API_KEY=your_secret_api_key_for_daletou
    ```

    `.env` 文件中定义的变量可以被 `docker-compose.yml` 文件引用，或者直接作为环境变量注入到容器中。这对于管理敏感数据或根据不同环境（开发、测试、生产）切换配置非常有用。

3.  **通过 `Dockerfile`**：
    在 [`Dockerfile`](./Dockerfile:1) 中，可以使用 `ENV` 指令设置构建时或运行时的环境变量。例如，在 [`Dockerfile`](./Dockerfile:34) 附近有注释示例：

    ```dockerfile
    # ... 其他指令 ...
    # ENV NODE_ENV production
    # ENV MY_API_KEY your_api_key_here
    # ... 其他指令 ...
    ```

    通过 `ENV` 设置的环境变量会成为镜像的一部分。对于运行时可能需要更改的配置或敏感信息，通常不建议直接在 [`Dockerfile`](./Dockerfile:1) 中硬编码。优先使用 `docker-compose.yml` 的 `environment` 配置或 `.env` 文件。
