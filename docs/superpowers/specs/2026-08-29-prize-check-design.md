# 本期中奖查询功能设计

## 目标

新增功能：用户输入自己购买的一组大乐透号码（前区 5 个 + 后区 2 个），系统对比**最新一期**开奖号码，算出该注**中了几等奖、多少钱**。

与现有 `/api/check`（查询某组号码历史上是否开过）不同，本功能聚焦"对比当期开奖号 → 判定奖级与奖金"。

## 范围确认

- **对比期次**：固定为数据集里期号最大的一期（最新一期）。
- **输入**：单张票，前区 5 个（1-35）、后区 2 个（1-12），空格分隔。
- **一/二等奖金额**：取该期数据中的 `first_prize_amount` / `second_prize_amount`（单注基本奖金，数据已含）。
- **仅基本投注**，不含追加投注。

## 奖级规则（基本投注单注）

| 前区命中 | 后区命中 | 奖级 | 单注奖金 |
|---------|---------|------|---------|
| 5 | 2 | 一等奖 | 浮动（该期 `first_prize_amount`）|
| 5 | 1 | 二等奖 | 浮动（该期 `second_prize_amount`）|
| 5 | 0 | 三等奖 | 固定 10000 |
| 4 | 2 | 四等奖 | 固定 3000 |
| 4 | 1 | 五等奖 | 固定 300 |
| 3 | 2 | 六等奖 | 固定 200 |
| 4 | 0 | 七等奖 | 固定 100 |
| 3 | 1 | 八等奖 | 固定 15 |
| 2 | 2 | 八等奖 | 固定 15 |
| 1 | 2 | 八等奖 | 固定 15 |
| 3 | 0 | 九等奖 | 固定 5 |
| 2 | 1 | 九等奖 | 固定 5 |
| 1 | 1 | 九等奖 | 固定 5 |
| 0 | 2 | 九等奖 | 固定 5 |
| 其它 | 其它 | 未中奖 | 0 |

## 后端设计

### 新增 `backend/prize.py`

集中定义奖级规则与判定逻辑，便于测试与复用。

- `PRIZE_RULES`：规则表，key 为 `(front_hit, back_hit)`，value 为 `{"tier": int, "name": str, "fixed": int | None}`（`fixed=None` 表示浮动奖）。
- `evaluate(front_hit: int, back_hit: int) -> dict | None`：命中规则返回奖级信息；未命中返回 `None`。
- 提供奖级名称中英文映射无关（名称由前端 i18n 负责，后端返回数字奖级 `tier` 与 `is_float` 标志）。

### 修改 `backend/main.py`

- 新增 `_latest_draw() -> dict | None`：从 `_all_draws()` 按 `_season_key` 取期号最大者。
- 新增端点 `GET /api/check-prize`：
  - 参数 `numbers: str`（复用现有 `_number_parts` 校验，非法返回 `matched=False, tier=0`）。
  - 取最新一期；若数据为空返回错误。
  - 计算前区命中数 = `len(set(query_front) & set(win_front))`，后区同理。
  - 调 `prize.evaluate`，确定奖级。
  - 一/二等奖金额取 `latest.first_prize_amount` / `second_prize_amount`；若缺失则该奖级金额记为 `None` 并标 `amount_missing=True`。
  - 响应结构：

    ```json
    {
      "numbers": "02 06 19 28 32 05 12",
      "winning": { "season": "25098", "front": [..5], "back": [..2], "draw_date": ".." },
      "front_hit": 5,
      "back_hit": 0,
      "tier": 3,
      "tier_name": "三等奖",
      "is_float": false,
      "amount": 10000,
      "amount_missing": false,
      "matched": true
    }
    ```

  - 未中奖：`tier=0, tier_name="未中奖", is_float=false, amount=0, matched=false`。

### 测试

- `backend/test_main.py` 增加 `test_check_prize` 系列：未中奖、三等奖（5+0）、一等奖浮动（5+2，金额取自最新期）、非法输入。
- 可选：`backend/test_prize.py` 覆盖 `prize.evaluate` 全部奖级与未中奖边界。

## 前端设计

### 抽取 `NumberSelector` 共享组件

把 `NumberSearch.tsx` 中的选号 Popover（35 前区球 + 12 后区球、选中/上限逻辑）抽出为 `frontend/src/components/NumberSelector.tsx`：

- Props：`front: number[]`、`back: number[]`、`onChange(front, back)`、`placeholder` 等。
- `NumberSearch` 改为使用 `NumberSelector`，行为保持不变（小幅重构，降低重复）。

### 新增 `PrizeCheck.tsx`

- 复用 `NumberSelector` 选号（默认 5+2 已选 / 空均可，查询前校验满 5+2）。
- 查询时 `fetch('/api/check-prize?numbers=...')`，复用现有 `AbortController` + `antdApp.message` 模式。
- 结果卡片展示：
  - 奖级名称（一等奖…九等奖 / 未中奖）。
  - 金额：小额（<10000）显示「¥X 元」，大额浮动显示「¥X.XX 万」（复用/扩展 `formatWan` 思路，新增金额格式化工具 `formatPrize`）。
  - 命中样式「中 5+0」与本期开奖号、期号、日期对照。
  - 浮动奖金且数据缺失时提示「浮动奖（数据缺失）」。
- 错误/加载态与 `NumberSearch` 一致。

### 类型与 i18n

- `frontend/src/types.ts` 增加 `PrizeResult` 接口（字段对应后端响应）。
- `frontend/src/i18n/locales/zh.json`、`en.json` 增加 `prizeCheck.*` 文案：`title`、各奖级名、`notWon`、`winPattern`（中 {{f}}+{{b}}）、`amountWan`/`amountYuan`、`floatMissing`、查询/错误文案。

### 接入 `App.tsx`

在 `<NumberSearch />` 下方挂载 `<PrizeCheck />`。

## 不做的事（YAGNI）

- 不做多张票批量查询。
- 不做追加投注计算。
- 不支指定历史期次（固定最新一期）。
- 不改动数据抓取逻辑。

## 验证

- 后端：`python -m unittest discover -s backend -p "test_*.py"`；`ruff check backend common`。
- 前端：`cd frontend && pnpm test`；`pnpm build` 通过。
- 手动：启动后端，访问 `/api/check-prize?numbers=<最新一期开奖号>` 应返回一等奖且金额正确。
