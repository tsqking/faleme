# 本期中奖查询功能 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增"输入号码 → 对比最新一期开奖号 → 判定中了几等奖、多少钱"的功能（后端接口 + 前端查询组件）。

**Architecture:** 后端在 `backend/prize.py` 用规则表集中定义大乐透奖级，新增 `GET /api/check-prize` 复用现有数据加载与号码解析；前端抽取选号 UI 为 `NumberSelector` 共享组件，`NumberSearch` 与新增的 `PrizeCheck` 复用，结果由前端按 `tier` 整数映射 i18n 文案。

**Tech Stack:** Python · FastAPI（后端）；React 19 · TypeScript · styled-components · Ant Design · react-i18next（前端）；unittest（后端测试）；vitest + Testing Library（前端测试）。

## Global Constraints

- 输入格式：前区 5 个（1-35）、后区 2 个（1-12），空格分隔，例如 `02 06 19 28 32 05 12`。
- 对比期次：固定为数据集中期号最大的一期（最新一期），不支指定历史期次。
- 仅基本投注，不含追加投注。
- 一/二等奖为浮动奖，金额取该期 `first_prize_amount` / `second_prize_amount`；缺失时 `amount_missing=True`。
- 后端返回 `tier` 整数（0=未中奖，1-9 对应一~九等奖）与 `is_float`/`amount`，**不返回本地化奖级名**；奖级名称由前端 i18n 按 `tier` 映射。
- 复用现有代码约定：`_number_parts`、`_all_draws()`、`_season_key()`、`_load_data()`、`fmt()`（前端）、`Ball` 组件、`AntdApp.useApp()` 的 message、AbortController 请求模式。
- 后端测试调用 `main` 函数直接验证（如 `main.check_prize(numbers=...)`），与 `test_main.py` 现有模式一致。
- 提交信息使用 conventional commits（如 `feat:`、`refactor:`、`test:`）。

---

### Task 1: 后端奖级规则模块 `backend/prize.py` + 测试

**Files:**
- Create: `backend/prize.py`
- Test: `backend/test_prize.py`

**Interfaces:**
- Produces: `prize.evaluate(front_hit: int, back_hit: int) -> dict | None`，返回 `{"tier": int, "is_float": bool, "fixed": int | None}`；未中奖返回 `None`。

- [ ] **Step 1: 写失败测试 `backend/test_prize.py`**

```python
import unittest

from backend import prize


class PrizeTests(unittest.TestCase):
    def test_first_prize_is_float(self):
        r = prize.evaluate(5, 2)
        self.assertEqual(r["tier"], 1)
        self.assertTrue(r["is_float"])

    def test_second_prize_is_float(self):
        r = prize.evaluate(5, 1)
        self.assertEqual(r["tier"], 2)
        self.assertTrue(r["is_float"])

    def test_third_prize_fixed(self):
        r = prize.evaluate(5, 0)
        self.assertEqual(r["tier"], 3)
        self.assertFalse(r["is_float"])
        self.assertEqual(r["fixed"], 10000)

    def test_fourth_to_seventh_fixed(self):
        self.assertEqual(prize.evaluate(4, 2)["tier"], 4)
        self.assertEqual(prize.evaluate(4, 1)["tier"], 5)
        self.assertEqual(prize.evaluate(3, 2)["tier"], 6)
        self.assertEqual(prize.evaluate(4, 0)["tier"], 7)
        self.assertEqual(prize.evaluate(4, 0)["fixed"], 100)

    def test_eighth_prize_combos(self):
        for fh, bh in [(3, 1), (2, 2), (1, 2)]:
            r = prize.evaluate(fh, bh)
            self.assertEqual(r["tier"], 8)
            self.assertEqual(r["fixed"], 15)

    def test_ninth_prize_combos(self):
        for fh, bh in [(3, 0), (2, 1), (1, 1), (0, 2)]:
            r = prize.evaluate(fh, bh)
            self.assertEqual(r["tier"], 9)
            self.assertEqual(r["fixed"], 5)

    def test_no_win_returns_none(self):
        self.assertIsNone(prize.evaluate(0, 0))
        self.assertIsNone(prize.evaluate(2, 0))
        self.assertIsNone(prize.evaluate(0, 1))


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd C:\Users\tsqki\workspace\faleme && python -m unittest backend.test_prize -v`
Expected: FAIL（`ModuleNotFoundError: No module named 'backend.prize'`）

- [ ] **Step 3: 实现 `backend/prize.py`**

```python
from typing import Any


PRIZE_RULES: dict[tuple[int, int], dict[str, Any]] = {
    (5, 2): {"tier": 1, "fixed": None},
    (5, 1): {"tier": 2, "fixed": None},
    (4, 2): {"tier": 4, "fixed": 3000},
    (4, 1): {"tier": 5, "fixed": 300},
    (3, 2): {"tier": 6, "fixed": 200},
    (4, 0): {"tier": 7, "fixed": 100},
    (3, 1): {"tier": 8, "fixed": 15},
    (2, 2): {"tier": 8, "fixed": 15},
    (1, 2): {"tier": 8, "fixed": 15},
    (3, 0): {"tier": 9, "fixed": 5},
    (2, 1): {"tier": 9, "fixed": 5},
    (1, 1): {"tier": 9, "fixed": 5},
    (0, 2): {"tier": 9, "fixed": 5},
    (5, 0): {"tier": 3, "fixed": 10000},
}


def evaluate(front_hit: int, back_hit: int) -> dict[str, Any] | None:
    rule = PRIZE_RULES.get((front_hit, back_hit))
    if rule is None:
        return None
    return {
        "tier": rule["tier"],
        "is_float": rule["fixed"] is None,
        "fixed": rule["fixed"],
    }
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd C:\Users\tsqki\workspace\faleme && python -m unittest backend.test_prize -v`
Expected: PASS（7 tests）

- [ ] **Step 5: 提交**

```bash
git add backend/prize.py backend/test_prize.py
git commit -m "feat: add 大乐透 prize tier evaluation module"
```

---

### Task 2: 后端新增 `GET /api/check-prize` 端点 + 测试

**Files:**
- Modify: `backend/main.py`（新增 `_latest_draw()` 与 `check_prize()`）
- Test: `backend/test_main.py`（在 `MainApiTests` 类内新增用例）

**Interfaces:**
- Consumes: `prize.evaluate(front_hit, back_hit)`（来自 Task 1）、`_all_draws()`、`_number_parts()`、`_season_key()`。
- Produces: `main.check_prize(numbers: str) -> dict`，结构：
  ```python
  {
      "numbers": str,
      "winning": {"season": str, "front": list[int], "back": list[int], "draw_date": str | None},
      "front_hit": int,
      "back_hit": int,
      "tier": int,          # 0 = 未中奖
      "is_float": bool,
      "amount": int,        # 缺失时返回 0
      "amount_missing": bool,
      "matched": bool,      # tier > 0
  }
  ```

- [ ] **Step 1: 写失败测试（追加到 `backend/test_main.py`）**

在 `MainApiTests` 类中 `test_health_returns_ok` 之后追加：

```python
    def test_check_prize_third_prize(self):
        self.write_data(
            [
                make_draw("001", "01 02 03 04 05 06 07"),
                make_draw("002", "02 06 19 28 32 05 12"),
            ]
        )

        result = main.check_prize(numbers="02 06 19 28 32 05 12")

        self.assertTrue(result["matched"])
        self.assertEqual(result["tier"], 3)
        self.assertFalse(result["is_float"])
        self.assertEqual(result["amount"], 10000)
        self.assertEqual(result["front_hit"], 5)
        self.assertEqual(result["back_hit"], 0)
        # 最新一期为 002
        self.assertEqual(result["winning"]["season"], "002")

    def test_check_prize_first_prize_uses_draw_amount(self):
        items = [
            {
                "season": "002",
                "number": "02 06 19 28 32 05 12",
                "pool": None,
                "first_prize_count": None,
                "first_prize_amount": 9835123,
                "second_prize_count": None,
                "second_prize_amount": None,
                "total_bets": None,
                "draw_date": "2025-08-30",
            }
        ]
        self.write_data(items)

        result = main.check_prize(numbers="02 06 19 28 32 05 12")

        self.assertEqual(result["tier"], 1)
        self.assertTrue(result["is_float"])
        self.assertEqual(result["amount"], 9835123)
        self.assertFalse(result["amount_missing"])

    def test_check_prize_no_win(self):
        self.write_data([make_draw("001", "01 02 03 04 05 06 07")])

        result = main.check_prize(numbers="11 12 13 14 15 08 09")

        self.assertFalse(result["matched"])
        self.assertEqual(result["tier"], 0)
        self.assertEqual(result["amount"], 0)

    def test_check_prize_invalid_input(self):
        self.write_data([make_draw("001")])

        result = main.check_prize(numbers="bad input")

        self.assertFalse(result["matched"])
        self.assertEqual(result["tier"], 0)
```

- [ ] **Step 2: 运行测试确认失败**

Run: `cd C:\Users\tsqki\workspace\faleme && python -m unittest backend.test_main.MainApiTests.test_check_prize_third_prize -v`
Expected: FAIL（`AttributeError: module 'backend.main' has no attribute 'check_prize'`）

- [ ] **Step 3: 实现端点（修改 `backend/main.py`）**

在 `from backend.scraper import refresh_data` 之后新增：

```python
from backend import prize as prize_module
```

在 `_all_draws()` 函数之后新增（约第 169 行后）：

```python
def _latest_draw() -> dict[str, Any] | None:
    draws = _all_draws()
    if not draws:
        return None
    return max(draws, key=lambda x: _season_key(x["season"]))
```

将现有 `check_numbers` 端点之后新增（约第 255 行后）：

```python
@app.get("/api/check-prize")
def check_prize(numbers: str = Query(..., description="7个空格分隔的号码，如 '02 06 19 28 32 05 12'")):
    latest = _latest_draw()
    if latest is None:
        return {
            "numbers": numbers,
            "winning": None,
            "front_hit": 0,
            "back_hit": 0,
            "tier": 0,
            "is_float": False,
            "amount": 0,
            "amount_missing": False,
            "matched": False,
        }

    query_parts = _number_parts(numbers)
    if query_parts is None:
        return {
            "numbers": numbers,
            "winning": {
                "season": latest["season"],
                "front": latest["front"],
                "back": latest["back"],
                "draw_date": latest["draw_date"],
            },
            "front_hit": 0,
            "back_hit": 0,
            "tier": 0,
            "is_float": False,
            "amount": 0,
            "amount_missing": False,
            "matched": False,
        }

    qf, qb = query_parts
    front_hit = len(set(qf) & set(latest["front"]))
    back_hit = len(set(qb) & set(latest["back"]))

    evaluated = prize_module.evaluate(front_hit, back_hit)
    if evaluated is None:
        return {
            "numbers": numbers,
            "winning": {
                "season": latest["season"],
                "front": latest["front"],
                "back": latest["back"],
                "draw_date": latest["draw_date"],
            },
            "front_hit": front_hit,
            "back_hit": back_hit,
            "tier": 0,
            "is_float": False,
            "amount": 0,
            "amount_missing": False,
            "matched": False,
        }

    tier = evaluated["tier"]
    is_float = evaluated["is_float"]
    if is_float:
        amount_key = "first_prize_amount" if tier == 1 else "second_prize_amount"
        amount = latest.get(amount_key)
        amount_missing = amount is None
    else:
        amount = evaluated["fixed"]
        amount_missing = amount is None

    return {
        "numbers": numbers,
        "winning": {
            "season": latest["season"],
            "front": latest["front"],
            "back": latest["back"],
            "draw_date": latest["draw_date"],
        },
        "front_hit": front_hit,
        "back_hit": back_hit,
        "tier": tier,
        "is_float": is_float,
        "amount": amount if amount is not None else 0,
        "amount_missing": amount_missing,
        "matched": tier > 0,
    }
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd C:\Users\tsqki\workspace\faleme && python -m unittest discover -s backend -p "test_*.py"`
Expected: PASS（含新增 4 个用例）

- [ ] **Step 5: 提交**

```bash
git add backend/main.py backend/test_main.py
git commit -m "feat: add /api/check-prize endpoint for current-period prize check"
```

---

### Task 3: 抽取 `NumberSelector` 共享组件并重用

**Files:**
- Create: `frontend/src/components/NumberSelector.tsx`
- Modify: `frontend/src/components/NumberSearch.tsx`（改为使用 `NumberSelector`，删除内部选号 UI）

**Interfaces:**
- Produces: `NumberSelector` 组件，Props：`{ front: number[]; back: number[]; onChange: (front: number[], back: number[]) => void; placeholder?: string }`。组件内部维护 Popover 展开态与临时选中态（tf/tb），确认时调用 `onChange(tf, tb)`。

- [ ] **Step 1: 创建 `frontend/src/components/NumberSelector.tsx`**

将 `NumberSearch.tsx` 中的样式（SearchRow 之外的 Selector/BallRow/Placeholder/PopContent/SectionTitle/Grid/NumBtn/Actions/CfmBtn/ClrBtn/CclBtn 样式）与选号逻辑移入：

```tsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Popover } from 'antd'
import { Ball } from './Ball'

const Selector = styled.div`
  flex: 1 1 200px;
  min-width: 0;
  padding: 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--color-primary);
  }
`

const BallRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  min-height: 32px;
  align-items: center;
`

const Placeholder = styled.span`
  color: var(--color-text-tertiary);
  font-size: 13px;
  line-height: 32px;
`

const PopContent = styled.div`
  max-width: 420px;
  width: calc(100vw - 32px);
`

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text);
`

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
`

const NumBtn = styled.button<{ $sel?: boolean; $zone: string }>`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid ${p => p.$sel ? (p.$zone === 'back' ? 'var(--color-ball-back)' : 'var(--color-ball-front-big)') : 'var(--color-border)'};
  background: ${p => p.$sel ? (p.$zone === 'back' ? 'var(--color-ball-back)' : 'var(--color-ball-front-big)') : 'var(--color-surface)'};
  color: ${p => p.$sel ? '#fff' : 'var(--color-text)'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    border-color: ${p => p.$zone === 'back' ? 'var(--color-ball-back)' : 'var(--color-ball-front-big)'};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 38px;
    height: 38px;
    font-size: 13px;
  }
`

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`

const CfmBtn = styled.button`
  padding: 6px 20px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const ClrBtn = styled.button`
  padding: 6px 14px;
  background: var(--color-surface);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
`

const CclBtn = styled.button`
  padding: 6px 20px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
`

interface Props {
  front: number[]
  back: number[]
  onChange: (front: number[], back: number[]) => void
  placeholder?: string
}

const frontNums = Array.from({ length: 35 }, (_, i) => i + 1)
const backNums = Array.from({ length: 12 }, (_, i) => i + 1)

export function NumberSelector({ front, back, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false)
  const [tf, setTf] = useState<number[]>(front)
  const [tb, setTb] = useState<number[]>(back)
  const { t } = useTranslation()

  const toggleF = (n: number) => {
    setTf(p => {
      if (p.includes(n)) return p.filter(x => x !== n)
      if (p.length >= 5) return p
      return [...p, n].sort((a, b) => a - b)
    })
  }

  const toggleB = (n: number) => {
    setTb(p => {
      if (p.includes(n)) return p.filter(x => x !== n)
      if (p.length >= 2) return p
      return [...p, n].sort((a, b) => a - b)
    })
  }

  const clear = () => { setTf([]); setTb([]) }

  const cancel = () => { setTf(front); setTb(back); setOpen(false) }

  const confirm = () => { onChange(tf, tb); setOpen(false) }

  const handleOpen = (v: boolean) => {
    if (v) { setTf(front); setTb(back) }
    setOpen(v)
  }

  const ready = tf.length === 5 && tb.length === 2

  const pop = (
    <PopContent>
      <SectionTitle>{t('numberSearch.frontTitle')}{tf.length}/5</SectionTitle>
      <Grid>
        {frontNums.map(n => (
          <NumBtn key={n} $zone="front" $sel={tf.includes(n)} disabled={!tf.includes(n) && tf.length >= 5} onClick={() => toggleF(n)}>
            {String(n).padStart(2, '0')}
          </NumBtn>
        ))}
      </Grid>
      <SectionTitle>{t('numberSearch.backTitle')}{tb.length}/2</SectionTitle>
      <Grid>
        {backNums.map(n => (
          <NumBtn key={n} $zone="back" $sel={tb.includes(n)} disabled={!tb.includes(n) && tb.length >= 2} onClick={() => toggleB(n)}>
            {String(n).padStart(2, '0')}
          </NumBtn>
        ))}
      </Grid>
      <Actions>
        <ClrBtn onClick={clear}>{t('numberSearch.clear')}</ClrBtn>
        <span style={{ display: 'flex', gap: 8 }}>
          <CclBtn onClick={cancel}>{t('numberSearch.cancel')}</CclBtn>
          <CfmBtn disabled={!ready} onClick={confirm}>{t('numberSearch.confirm')}</CfmBtn>
        </span>
      </Actions>
    </PopContent>
  )

  const hasValue = front.length > 0 || back.length > 0

  return (
    <Popover content={pop} trigger="click" open={open} onOpenChange={handleOpen} placement="bottomLeft">
      <Selector>
        {hasValue ? (
          <BallRow>
            {front.map(n => <Ball key={n} value={n} zone="front" compact />)}
            {back.map(n => <Ball key={n} value={n} zone="back" compact />)}
          </BallRow>
        ) : (
          <Placeholder>{placeholder ?? t('numberSearch.placeholder')}</Placeholder>
        )}
      </Selector>
    </Popover>
  )
}
```

- [ ] **Step 2: 重写 `frontend/src/components/NumberSearch.tsx` 使用 `NumberSelector`**

保留原文件顶部的 `SearchRow`/`QueryBtn`/`ResultTag`/`ErrMsg` 样式与 `fmt()`，将选号 Popover 部分替换为：

```tsx
import { NumberSelector } from './NumberSelector'
```

`NumberSearch` 组件体替换为：

```tsx
export function NumberSearch() {
  const [front, setFront] = useState<number[]>([2, 6, 19, 28, 32])
  const [back, setBack] = useState<number[]>([5, 12])
  const [result, setResult] = useState<CheckResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const { t } = useTranslation()
  const { message } = AntdApp.useApp()
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const doSearch = async (f: number[], b: number[]) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setErr(null)
    setResult(null)
    try {
      const r = await fetch(`/api/check?numbers=${encodeURIComponent(fmt(f, b))}`, { signal: controller.signal })
      if (!r.ok) throw new Error(t('numberSearch.queryFailed'))
      const d: CheckResult = await r.json()
      setResult(d)
    } catch (e) {
      if (controller.signal.aborted) return
      setErr(e instanceof Error ? e.message : t('numberSearch.queryError'))
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  const doQuery = () => {
    if (front.length === 5 && back.length === 2) {
      doSearch(front, back)
    } else {
      message.warning(t('numberSearch.selectHint', { front: 5 - front.length, back: 2 - back.length }))
    }
  }

  return (
    <SearchRow>
      <NumberSelector front={front} back={back} onChange={(f, b) => { setFront(f); setBack(b) }} />
      <QueryBtn onClick={doQuery}>{t('numberSearch.query')}</QueryBtn>
      {err && <ErrMsg>{err}</ErrMsg>}
      {!loading && result && (
        <ResultTag $hit={result.matched}>
          {result.matched ? <CheckCircleOutlined /> : <InfoCircleOutlined />}
          {result.matched
            ? t('numberSearch.matched', { count: result.total_matches, seasons: result.matches.map(m => m.season).join(', ') })
            : t('numberSearch.neverMatched')}
        </ResultTag>
      )}
    </SearchRow>
  )
}
```

删除原文件中已迁移到 `NumberSelector` 的样式与选号逻辑，仅保留 `SearchRow`、`QueryBtn`、`ResultTag`、`ErrMsg`、`fmt` 及必要的 import（`useState`、`useRef`、`useEffect`、`useTranslation`、`styled`、`App as AntdApp`、`Icons`、`CheckResult`、`Ball` 不再需要，移除 `Popover`/`Ball` import 若不再使用）。

- [ ] **Step 3: 构建前端确认无类型错误**

Run: `cd C:\Users\tsqki\workspace\faleme\frontend && pnpm build`
Expected: 构建成功（无 TS 报错）

- [ ] **Step 4: 提交**

```bash
git add frontend/src/components/NumberSelector.tsx frontend/src/components/NumberSearch.tsx
git commit -m "refactor: extract NumberSelector shared component from NumberSearch"
```

---

### Task 4: 前端类型与金额格式化工具

**Files:**
- Modify: `frontend/src/types.ts`（新增 `PrizeResult`）
- Modify: `frontend/src/utils/format.ts`（新增 `formatPrize`）

**Interfaces:**
- Produces: `PrizeResult` 接口与 `formatPrize(amount: number, isFloat: boolean, amountMissing: boolean, t: TFunction) -> string`。

- [ ] **Step 1: `frontend/src/types.ts` 末尾追加**

```ts
export interface PrizeResult {
  numbers: string
  winning: { season: string; front: number[]; back: number[]; draw_date: string | null } | null
  front_hit: number
  back_hit: number
  tier: number
  is_float: boolean
  amount: number
  amount_missing: boolean
  matched: boolean
}
```

- [ ] **Step 2: `frontend/src/utils/format.ts` 追加**

```ts
import type { TFunction } from 'i18next'

export function formatPrize(amount: number, isFloat: boolean, amountMissing: boolean, t: TFunction): string {
  if (isFloat && amountMissing) return t('prizeCheck.floatMissing')
  if (amount >= 10000) return '¥' + (amount / 10000).toFixed(2) + t('common.wan')
  return '¥' + amount + t('prizeCheck.yuan')
}
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/types.ts frontend/src/utils/format.ts
git commit -m "feat: add PrizeResult type and formatPrize util"
```

---

### Task 5: 新增 `PrizeCheck` 组件

**Files:**
- Create: `frontend/src/components/PrizeCheck.tsx`

**Interfaces:**
- Consumes: `NumberSelector`（Task 3）、`PrizeResult`（Task 4）、`formatPrize`（Task 4）、`Ball` 组件、`/api/check-prize` 端点（Task 2）。
- Produces: `PrizeCheck` 组件，渲染选号 + 查询按钮 + 结果卡片。

- [ ] **Step 1: 创建 `frontend/src/components/PrizeCheck.tsx`**

```tsx
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { App as AntdApp } from 'antd'
import { InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import type { PrizeResult } from '../types'
import { Ball } from './Ball'
import { NumberSelector } from './NumberSelector'
import { formatPrize } from '../utils/format'

const Card = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);

  @media (max-width: 768px) {
    margin-bottom: 16px;
    padding: 12px;
  }
`

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-text);
`

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`

const QueryBtn = styled.button`
  padding: 17px 24px;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;

  &:hover {
    opacity: 0.85;
  }
`

const ResultArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const ResultTag = styled.span<{ $hit: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 8px;
  background: ${p => p.$hit ? 'var(--color-success-bg)' : 'var(--color-neutral-bg)'};
  border: 1px solid ${p => p.$hit ? 'var(--color-success-border)' : 'var(--color-neutral-border)'};
  color: ${p => p.$hit ? 'var(--color-success-text)' : 'var(--color-neutral-text)'};
`

const Amount = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: var(--color-primary);
`

const Note = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
`

const Winning = styled.div`
  border-top: 1px dashed var(--color-border);
  padding-top: 10px;
`

const WinLabel = styled.div`
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
`

const BallRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
`

const ErrMsg = styled.span`
  color: var(--color-danger);
  font-size: 12px;
`

function fmt(f: number[], b: number[]): string {
  return [...f.map(n => String(n).padStart(2, '0')), ...b.map(n => String(n).padStart(2, '0'))].join(' ')
}

export function PrizeCheck() {
  const [front, setFront] = useState<number[]>([])
  const [back, setBack] = useState<number[]>([])
  const [result, setResult] = useState<PrizeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const { t } = useTranslation()
  const { message } = AntdApp.useApp()
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const doSearch = async (f: number[], b: number[]) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setErr(null)
    setResult(null)
    try {
      const r = await fetch(`/api/check-prize?numbers=${encodeURIComponent(fmt(f, b))}`, { signal: controller.signal })
      if (!r.ok) throw new Error(t('prizeCheck.queryFailed'))
      setResult(await r.json())
    } catch (e) {
      if (controller.signal.aborted) return
      setErr(e instanceof Error ? e.message : t('prizeCheck.queryError'))
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  const doQuery = () => {
    if (front.length === 5 && back.length === 2) {
      doSearch(front, back)
    } else {
      message.warning(t('prizeCheck.selectHint', { front: 5 - front.length, back: 2 - back.length }))
    }
  }

  return (
    <Card>
      <Title>{t('prizeCheck.title')}</Title>
      <Row>
        <NumberSelector
          front={front}
          back={back}
          onChange={(f, b) => { setFront(f); setBack(b); setResult(null); setErr(null) }}
          placeholder={t('prizeCheck.placeholder')}
        />
        <QueryBtn onClick={doQuery}>{t('prizeCheck.query')}</QueryBtn>
      </Row>
      {err && <ErrMsg>{err}</ErrMsg>}
      {!loading && result && (
        <ResultArea>
          <ResultTag $hit={result.matched}>
            {result.matched ? <CheckCircleOutlined /> : <InfoCircleOutlined />}
            {t(`prizeCheck.tier${result.tier}`)}
            {result.matched && <> · {t('prizeCheck.winPattern', { f: result.front_hit, b: result.back_hit })}</>}
          </ResultTag>
          {result.matched && (
            <Amount>
              {t('prizeCheck.amount')}：{formatPrize(result.amount, result.is_float, result.amount_missing, t)}
            </Amount>
          )}
          {!result.matched && <Note>{t('prizeCheck.notWon')}</Note>}
          {result.winning && (
            <Winning>
              <WinLabel>
                {t('prizeCheck.winningTitle')}（{t('prizeCheck.season')} {result.winning.season} · {result.winning.draw_date ?? t('common.dash')}）
              </WinLabel>
              <BallRow>
                {result.winning.front.map(n => <Ball key={'f' + n} value={n} zone="front" compact />)}
                {result.winning.back.map(n => <Ball key={'b' + n} value={n} zone="back" compact />)}
              </BallRow>
            </Winning>
          )}
        </ResultArea>
      )}
    </Card>
  )
}
```

- [ ] **Step 2: 接入 `frontend/src/App.tsx`**

在 import 区新增：`import { PrizeCheck } from './components/PrizeCheck'`
在 `<NumberSearch />` 之后新增：`<PrizeCheck />`

- [ ] **Step 3: 构建确认**

Run: `cd C:\Users\tsqki\workspace\faleme\frontend && pnpm build`
Expected: 构建成功

- [ ] **Step 4: 提交**

```bash
git add frontend/src/components/PrizeCheck.tsx frontend/src/App.tsx
git commit -m "feat: add PrizeCheck component for current-period prize query"
```

---

### Task 6: i18n 文案（中文 + 英文）

**Files:**
- Modify: `frontend/src/i18n/locales/zh.json`
- Modify: `frontend/src/i18n/locales/en.json`

**Interfaces:**
- Produces: `prizeCheck.*` 文案键，前端 `PrizeCheck` 与 `formatPrize` 依赖。

- [ ] **Step 1: `zh.json` 在 `numberSearch` 之后新增 `prizeCheck` 块**

```json
  "prizeCheck": {
    "title": "本期中奖查询",
    "placeholder": "点击选择号码",
    "query": "查询中奖",
    "queryFailed": "查询失败",
    "queryError": "查询出错",
    "selectHint": "请先选满号码（前区还差{{front}}个，后区还差{{back}}个）",
    "tier0": "未中奖",
    "tier1": "一等奖",
    "tier2": "二等奖",
    "tier3": "三等奖",
    "tier4": "四等奖",
    "tier5": "五等奖",
    "tier6": "六等奖",
    "tier7": "七等奖",
    "tier8": "八等奖",
    "tier9": "九等奖",
    "winPattern": "中 {{f}}+{{b}}",
    "yuan": "元",
    "floatMissing": "浮动奖（数据缺失）",
    "notWon": "未中奖，再接再厉",
    "winningTitle": "本期开奖",
    "season": "期号",
    "amount": "奖金"
  },
```

- [ ] **Step 2: `en.json` 在 `numberSearch` 之后新增 `prizeCheck` 块**

```json
  "prizeCheck": {
    "title": "Current Draw Prize Check",
    "placeholder": "Click to select numbers",
    "query": "Check Prize",
    "queryFailed": "Query failed",
    "queryError": "Query error",
    "selectHint": "Please select all numbers first ({{front}} front + {{back}} back remaining)",
    "tier0": "No prize",
    "tier1": "1st Prize",
    "tier2": "2nd Prize",
    "tier3": "3rd Prize",
    "tier4": "4th Prize",
    "tier5": "5th Prize",
    "tier6": "6th Prize",
    "tier7": "7th Prize",
    "tier8": "8th Prize",
    "tier9": "9th Prize",
    "winPattern": "Hit {{f}}+{{b}}",
    "yuan": " yuan",
    "floatMissing": "Float prize (data missing)",
    "notWon": "No prize this time",
    "winningTitle": "Latest Draw",
    "season": "Issue",
    "amount": "Prize"
  },
```

- [ ] **Step 3: 提交**

```bash
git add frontend/src/i18n/locales/zh.json frontend/src/i18n/locales/en.json
git commit -m "feat: add i18n strings for prize check"
```

---

### Task 7: 端到端验证与静态检查

**Files:** 无新增，仅运行检查。

- [ ] **Step 1: 后端测试 + lint**

Run: `cd C:\Users\tsqki\workspace\faleme && python -m unittest discover -s backend -p "test_*.py" && pip install -r backend/requirements-dev.txt -q && ruff check backend common && ruff format --check backend common`
Expected: 全部 PASS / 无 lint 错误

- [ ] **Step 2: 前端构建 + 测试**

Run: `cd C:\Users\tsqki\workspace\faleme\frontend && pnpm build && pnpm test`
Expected: 构建成功、测试通过

- [ ] **Step 3: 手动冒烟（可选）**

启动后端（`uvicorn backend.main:app --port 8000`），用最新一期开奖号请求：
`curl "http://127.0.0.1:8000/api/check-prize?numbers=<最新一期开奖号>"`
Expected：`tier` 为 1，`amount` 等于该期 `first_prize_amount`，`matched` 为 true。

- [ ] **Step 4: 提交（如有修正）**

若上述检查发现问题并修复，按修正内容提交；无修正则跳过。

---

## 自审（Self-Review）

- **Spec 覆盖**：奖级规则 → Task 1；`/api/check-prize` → Task 2；`NumberSelector` 抽取 → Task 3；`PrizeResult`/`formatPrize` → Task 4；`PrizeCheck` 组件与 App 接入 → Task 5；i18n → Task 6；验证 → Task 7。均覆盖。
- **占位符扫描**：无 TBD/TODO；各步骤均含可运行代码或确切命令。
- **类型一致性**：后端返回字段与 `PrizeResult`（`types.ts`）一致；`formatPrize` 签名与 `PrizeCheck` 调用一致；`NumberSelector` Props 在 Task 3 定义、Task 5 使用一致；i18n 键 `prizeCheck.tier${tier}`、`winPattern`、`yuan`、`floatMissing`、`amount`、`season`、`winningTitle`、`notWon`、`title`、`placeholder`、`query`、`queryFailed`、`queryError`、`selectHint` 均在 Task 6 定义并在 Task 5 使用。
