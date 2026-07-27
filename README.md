# Faleme - 大乐透数据分析平台

一个中国体彩大乐透历史数据的可视化分析工具，提供开奖历史查询、号码频率统计、走势图分析、冷热号排名等功能。

## 功能特性

- **号码搜索** - 输入一组号码，查询是否中过奖
- **统计概览** - 一等奖/二等奖注数与金额、奖池金额、总投注额等关键指标
- **开奖历史** - 分页浏览所有历史开奖记录，含前区/后区号码、奖金详情
- **走势图** - 可视化各期号码走势，支持按期号范围筛选
- **频率统计** - 前区 (1-35) 和后区 (1-12) 各号码的出现频次柱状图
- **冷热号分析** - 自定义统计期数 (默认近 30 期)，排名冷热号码
- **全屏查看** - 走势图、频率图、冷热号等卡片支持一键全屏
- **多语言支持** - 中文 / English / 日本語 / Français / 한국어 / Русский / ภาษาไทย

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Python · FastAPI · Uvicorn |
| 数据抓取 | Requests · BeautifulSoup4 |
| 前端框架 | React 19 · TypeScript · Vite 8 |
| UI 组件 | Ant Design 6 · styled-components |
| 图表 | Recharts |
| 国际化 | i18next · react-i18next |
| 部署 | Docker · docker-compose |

## 项目结构

```
faleme/
├── backend/
│   ├── main.py          # FastAPI 应用，定义所有 API 路由
│   ├── scraper.py       # 从 500.com 抓取大乐透历史数据
│   ├── config.py        # 集中配置（数据文件路径等）
│   ├── data.json        # 缓存的开奖数据（自动生成）
│   ├── requirements.txt
│   ├── test_main.py     # API 测试
│   └── test_scraper.py  # 抓取与解析测试
├── common/
│   └── utils.py         # 共用工具（请求头等）
├── frontend/
│   ├── src/
│   │   ├── components/  # UI 组件
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── FrequencyChart.tsx
│   │   │   ├── FullscreenCard.tsx
│   │   │   ├── HistoryTable.tsx
│   │   │   ├── HotColdRank.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── NumberSearch.tsx
│   │   │   ├── StatsCards.tsx
│   │   │   └── TrendChart.tsx
│   │   ├── hooks/       # 自定义 Hooks
│   │   ├── i18n/        # 多语言资源
│   │   ├── styles/      # 全局与组件样式
│   │   ├── types.ts     # TypeScript 类型定义
│   │   ├── App.tsx      # 根组件
│   │   └── main.tsx     # 入口文件
│   └── package.json
├── Dockerfile           # 多阶段构建（前端构建 + 后端运行）
├── docker-compose.yml
├── start.sh             # 一键启动脚本
└── README.md
```

## 快速开始

### 环境要求

- Python 3.11+
- Node.js 22+
- pnpm

### 安装依赖

```bash
# 后端依赖
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

# 前端依赖
cd frontend
pnpm install
cd ..
```

### 一键启动

```bash
bash start.sh
```

该脚本会同时启动后端 (FastAPI, 端口 8000) 和前端 (Vite Dev Server, 端口 5173)。

### 分别启动

```bash
# 后端
uvicorn backend.main:app --host 127.0.0.1 --port 8000

# 前端
cd frontend
pnpm dev
```

启动后访问 http://localhost:5173 即可使用。

### Docker 部署

```bash
docker compose up --build
```

采用多阶段构建：第一阶段用 Node 构建前端静态资源，第二阶段在 Python 镜像中安装后端依赖并托管前端产物，由 FastAPI 统一提供 API 与静态站点服务。容器以非 root 用户运行，启动后访问 http://localhost:8000。

生产环境可通过 `CORS_ALLOW_ORIGINS` 环境变量配置允许的跨域来源（逗号分隔）。

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/history?page=1&page_size=20` | 分页获取开奖历史 |
| GET | `/api/stats/frequency` | 号码出现频率统计 |
| GET | `/api/stats/trend?start_season=&end_season=&limit=` | 走势数据 |
| GET | `/api/stats/hot-cold?period=30` | 冷热号排名 |
| GET | `/api/check?numbers=02 06 19 28 32 05 12` | 查询号码是否中奖 |

启动后访问 http://localhost:8000/docs 查看完整的 Swagger 文档。

## 测试

后端使用 Python 标准库 `unittest`：

```bash
python -m unittest discover -s backend -p "test_*.py"
```

覆盖范围：数据抓取的 HTML 解析与整数解析容错，以及历史 / 频率 / 走势 / 号码查询等 API。

## 数据来源

历史开奖数据自动从 [500.com](https://datachart.500star.com/dlt/history/newinc/history.php) 抓取，后端启动时会检查 `data.json` 是否为当天数据，若非最新则自动更新。
