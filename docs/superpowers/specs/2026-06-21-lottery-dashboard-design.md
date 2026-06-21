# 大乐透看板与走势图 — 设计文档

## 概述

为现有大乐透开奖数据（data.json）创建一个全功能看板和走势图前端应用，后端提供 REST API，前端在页面加载时自动拉取数据。

## 架构

```
frontend/ (Vite + React + TS + Recharts)
    └── /api/* ──proxy──→ backend/ (FastAPI) ──→ data.json
```

- 后端：FastAPI 读取 data.json 并提供 RESTful API
- 前端：Vite + React + TypeScript + Recharts 图表库
- 开发时通过 Vite proxy 转发 `/api` 到 FastAPI

## 后端 API

| 接口 | 说明 |
|------|------|
| `GET /api/history?page=1&page_size=20` | 分页历史数据（降序） |
| `GET /api/stats/frequency` | 前区(01-35)/后区(01-12)频率统计 |
| `GET /api/stats/trend` | 每期各位置号码走势数据 |
| `GET /api/stats/hot-cold?period=30` | 指定期数内的冷热号分析 |

## 前端组件

- `StatsCards` — 统计概览卡片（总期数、最热前区号、最热后区号、冷号等）
- `TrendChart` — 走势折线图（选择查看前区5个位置或后区2个位置）
- `FrequencyChart` — 号码频率柱状图（前区35个、后区12个）
- `HotColdRank` — 冷热号排行榜（高频Top10 / 低频Top10）
- `HistoryTable` — 分页历史开奖表格

## 数据流

1. 页面加载 → `useLotteryData` hook 并行请求 4 个 API
2. 每个 API 返回后更新对应组件状态
3. 图表组件使用 Recharts 渲染
4. 表格支持分页切换
