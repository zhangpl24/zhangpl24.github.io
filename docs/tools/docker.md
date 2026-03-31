---
date: 2026-03-31
icon: lucide/container
description: Docker 常用命令与容器/虚拟环境概念备忘。
---

# Docker 常用命令大全

| 命令             | 用途   | 示例                               |
| -------------- | ---- | -------------------------------- |
| `docker pull`  | 下载镜像 | `docker pull ubuntu`             |
| `docker run`   | 运行容器 | `docker run -it ubuntu bash`     |
| `docker ps`    | 查看容器 | `docker ps -a`                   |
| `docker stop`  | 停止容器 | `docker stop container_id`       |
| `docker rm`    | 删除容器 | `docker rm container_id`         |
| `docker rmi`   | 删除镜像 | `docker rmi image_id`            |
| `docker exec`  | 进入容器 | `docker exec -it container bash` |
| `docker logs`  | 查看日志 | `docker logs -f container`       |
| `docker build` | 构建镜像 | `docker build -t myapp .`        |
| `docker push`  | 推送镜像 | `docker push myapp:latest`       |
| `docker save`  | 保存镜像 | `docker save myapp -o myapp.tar` |
| `docker load`  | 加载镜像 | `docker load -i myapp.tar`       |

# Docker 的理解

- 其实和虚拟环境还是有区别的：
	- 虚拟环境只提供某些库的不同版本，如python的各种库
	- docker 则是将操作系统级别的东西一同打包好了
- docker 容器启动后：
	- 相当于一台小的虚拟机，可以让服务在其上持久的跑