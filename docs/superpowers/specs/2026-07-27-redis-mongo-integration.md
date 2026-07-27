# Redis 与 MongoDB 集成 - 设计文档

## 概述

为现有大乐透数据分析平台引入 Redis 与 MongoDB 支持。基于项目现状（`data.json` 文件存储 + 模块级内存缓存 `_data_cache` + 启动时同步抓取），按最佳实践分层划分职责：MongoDB 作为历史开奖数据的主存储，Redis 作为缓存层，APScheduler 承担定时抓取。

## 职责定位（核心决策）

分层职责清晰，让每个组件做自己最擅长的事：

| 组件 | 角色 | 替代/增强什么 | 理由 |
|------|------|--------------|------|
| **MongoDB** | 历史开奖数据的**主存储（source of truth）** | 替代 `data.json` | 结构化、持续增长的历史记录；需按 `season` 去重 upsert、范围/分页查询、建索引；文档模型天然契合一条开奖=一个文档 |
| **Redis** | **缓存层**（API 响应 + 聚合结果） | 替代模块级 `_data_cache` | 多 worker 共享、TTL 自动过期、降低 Mongo 读压力；聚合查询（frequency/trend/hot-cold）计算成本高，缓存收益大 |
| **APScheduler** | 进程内**定时抓取** | 替代"启动时抓取" | 每天开奖后自动刷新，无需额外 worker 进程（轻量务实） |

> 若预期用途不同（例如 Mongo 仅做日志、Redis 仅做限流），定位需相应调整。

## 架构总览

```
                ┌─────────────┐
   500.com ───▶ │  scraper    │ ──upsert──▶ MongoDB (draws)
                │ (APScheduler│                  │
                │  每日定时)  │                  │ 查询
                └─────────────┘                  ▼
                                     ┌──────────────────┐
            HTTP 请求 ──▶ FastAPI ──▶│  repository 层   │
                                     └──────┬───────────┘
                                       读   │   写回（cache-aside）
                                            ▼
                                       Redis (缓存)
```

## 技术选型

| 项 | 选型 | 备注 |
|----|------|------|
| Mongo 驱动 | `motor`（async） | FastAPI 是 async 栈，motor 配套；路由需改为 `async def` |
| Redis 客户端 | `redis`（`redis.asyncio`） | 与 motor 一致走 async |
| 配置管理 | `pydantic-settings` | 集中管理 `MONGO_URI`/`REDIS_URL`/`DB_NAME`/缓存 TTL，替代散落的 `os.environ.get` |
| 定时任务 | `apscheduler`（`AsyncIOScheduler`） | lifespan 内启停，无需独立 worker 容器 |
| 容器 | docker-compose 加 `redis`、`mongo` 服务 | 健康检查 + 数据卷持久化 |

> 备选：若想保持路由同步、降低改动量，Mongo 可用 `pymongo`（同步）、Redis 用 `redis` 同步客户端；任务队列可升级为 `rq` + 独立 worker。但 async 是 FastAPI 最佳实践，推荐。

## 数据模型（MongoDB）

collection：`draws`

```jsonc
{
  "_id": "24150",                 // 用 season 作 _id，天然唯一
  "season": "24150",
  "front": [2, 6, 19, 28, 32],
  "back": [5, 12],
  "pool": 1000000000,
  "first_prize_count": 3,
  "first_prize_amount": 10000000,
  "second_prize_count": 10,
  "second_prize_amount": 5000000,
  "total_bets": 100000000,
  "draw_date": "2024-12-30",
  "updated_at": "2026-07-27T..."
}
```

索引：

- `_id` / `season` 唯一（upsert 去重依据）
- `draw_date`（按日期范围查询）
- `season` 升序（走势/分页排序）

## 代码结构变更

```
backend/
├── config.py            # 改为 pydantic-settings：MONGO_URI/REDIS_URL/TTL/CRON 等
├── db/
│   ├── __init__.py      # motor AsyncIOMotorClient / redis.asyncio 单例
│   ├── mongo.py
│   └── redis.py
├── repository/
│   ├── __init__.py
│   └── draws.py         # DrawRepository: upsert_many / list_page / count / aggregate
├── cache.py             # cache-aside 工具：get_or_set(key, ttl, loader)
├── scheduler.py         # APScheduler：注册每日 refresh 任务
├── scraper.py           # 改为：抓取 -> upsert Mongo（不再写 data.json）
├── main.py              # 路由改 async，经 repository + cache；lifespan 启停 scheduler
└── scripts/
    └── migrate_data_json.py   # 一次性导入 data.json -> Mongo
```

## 关键实现要点

### a. Repository 层（`repository/draws.py`）

- `upsert_many(rows)`：用 `bulk_write` + `UpdateOne(..., upsert=True)` 按 `season` 批量去重写入
- `list_page(page, page_size)`：`find().sort("season",-1).skip().limit()`
- `count()` / `stats_frequency()` / `stats_hot_cold(period)`：用 Mongo 聚合管道（`$unwind` + `$group`）在数据库侧算，比现在 Python 端遍历高效

### b. 缓存策略（`cache.py`，cache-aside）

- Key 设计：`api:history:{page}:{page_size}`、`api:frequency`、`api:hot-cold:{period}`、`api:trend:{hash}`
- TTL：数据每日更新一次，可给较长 TTL（如 6~12h）；`refresh_data` 成功后用**版本号前缀**（`api:v2:...`）或 `SCAN` + `DELETE` 批量失效，避免逐 key 清理
- 序列化：JSON 字符串存 Redis（值小且通用）；不引入 pickle 避免反序列化风险

### c. 定时抓取（`scheduler.py`）

- `AsyncIOScheduler`，`add_job(refresh_data, 'cron', hour=22)`（大乐透开奖后）
- lifespan 启动时：若 Mongo 为空先触发一次 `refresh_data`，再注册定时任务；停止时 `scheduler.shutdown()`
- `refresh_data` 成功后清缓存

### d. 迁移脚本（`scripts/migrate_data_json.py`）

- 读取 `backend/data.json` -> `upsert_many` 导入 Mongo
- 幂等（upsert），可重复执行

### e. 路由改造（`main.py`）

- `def get_history` -> `async def get_history`，调用 `await repo.list_page(...)`，外层包 `await cache.get_or_set(...)`
- 移除 `_data_cache` / `_load_data` / `_load_raw` / `_parse_numbers`（解析职责下沉到 scraper->Mongo）

## 分阶段实施步骤

1. **基础设施**：`docker-compose.yml` 加 `mongo`/`redis`（带健康检查与卷）；`requirements.txt` 加 motor/redis/apscheduler/pydantic-settings
2. **配置层**：`config.py` 改 `pydantic-settings`；`db/` 建单例连接；lifespan 管理连接生命周期
3. **Repository + 迁移**：实现 `DrawRepository`；写 `migrate_data_json.py` 并跑一次导入
4. **scraper 改造**：抓取结果 `upsert_many` 到 Mongo，删除写文件逻辑
5. **路由改造**：5 个端点改 async，走 repository
6. **Redis 缓存**：加 `cache.py`，端点接 cache-aside，实现失效机制
7. **定时任务**：`scheduler.py` + lifespan 启停
8. **测试与文档**：补 repository/缓存测试，更新 README

## 测试策略

- **Repository**：`mongomock` 或 testcontainers 起真实 Mongo，测 upsert 去重、分页、聚合
- **缓存**：`fakeredis` 测 `get_or_set` 与失效逻辑
- **集成**：保留现有 `unittest` 体系；API 测试用临时 Mongo DB + fakeredis fixture

## 主要决策点

| 决策 | 推荐 | 备选 |
|------|------|------|
| 同步 vs 异步 | async + motor + redis.asyncio | 同步 pymongo + redis（改动小，但非最佳） |
| 任务调度 | APScheduler 进程内 | RQ + 独立 worker（更正规，多一个容器） |
| 是否保留 `data.json` 降级 | 不保留，直接切 Mongo | 保留作 fallback（增加分支与一致性成本） |
| 缓存失效方式 | 版本号前缀 | SCAN+DEL（key 多时慢） |

## 文件变更清单

- 新建：`backend/db/{__init__,mongo,redis}.py`、`backend/repository/{__init__,draws}.py`、`backend/cache.py`、`backend/scheduler.py`、`backend/scripts/migrate_data_json.py`
- 修改：`backend/config.py`、`backend/main.py`、`backend/scraper.py`、`backend/requirements.txt`、`docker-compose.yml`、`README.md`
- 移除/弃用：`backend/data.json`（迁移后）、`common/utils.py` 可保留
