import json
import os
from contextlib import asynccontextmanager
from datetime import date
from typing import Any

from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.scraper import refresh_data

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.json")
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist")

_data_cache: list[dict[str, Any]] | None = None


def _load_raw() -> Any:
    with open(DATA_FILE, encoding="utf-8") as f:
        return json.load(f)


def _load_data() -> list[dict[str, Any]]:
    global _data_cache
    if _data_cache is not None:
        return _data_cache
    raw = _load_raw()
    _data_cache = raw["data"] if isinstance(raw, dict) else raw
    return _data_cache


@asynccontextmanager
async def lifespan(app: FastAPI):
    today = date.today().isoformat()

    if not os.path.exists(DATA_FILE):
        print("data.json 不存在，正在从网络获取...")
        try:
            refresh_data()
            print("数据获取完成")
        except Exception as e:
            print(f"数据获取失败: {e}")
    else:
        raw = _load_raw()
        if isinstance(raw, list):
            print("data.json 格式较旧，正在重新抓取...")
            try:
                refresh_data()
                print("数据更新完成")
            except Exception as e:
                print(f"数据更新失败，使用旧数据: {e}")
        elif raw.get("_fetched_date") != today:
            print(f"数据日期 {raw.get('_fetched_date')} 与今天 {today} 不一致，正在重新抓取...")
            try:
                refresh_data()
                print("数据更新完成")
            except Exception as e:
                print(f"数据更新失败，使用旧数据: {e}")
        else:
            print(f"数据已是最新 ({today})")

    yield


app = FastAPI(title="大乐透数据 API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _parse_numbers(item: dict[str, Any]) -> dict[str, Any]:
    parts = item["number"].split()
    return {
        "season": item["season"],
        "front": [int(x) for x in parts[:5]],
        "back": [int(x) for x in parts[5:]],
        "pool": item.get("pool"),
        "first_prize_count": item.get("first_prize_count"),
        "first_prize_amount": item.get("first_prize_amount"),
        "second_prize_count": item.get("second_prize_count"),
        "second_prize_amount": item.get("second_prize_amount"),
        "total_bets": item.get("total_bets"),
        "draw_date": item.get("draw_date"),
    }


@app.get("/api/history")
def get_history(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100)):
    data = [_parse_numbers(d) for d in _load_data()]
    data.sort(key=lambda x: x["season"], reverse=True)
    total = len(data)
    start = (page - 1) * page_size
    end = start + page_size
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "items": data[start:end],
    }


@app.get("/api/stats/frequency")
def get_frequency():
    data = _load_data()
    front_counts: dict[int, int] = {i: 0 for i in range(1, 36)}
    back_counts: dict[int, int] = {i: 0 for i in range(1, 13)}

    for item in data:
        parts = [int(x) for x in item["number"].split()]
        for n in parts[:5]:
            front_counts[n] = front_counts.get(n, 0) + 1
        for n in parts[5:]:
            back_counts[n] = back_counts.get(n, 0) + 1

    return {
        "front": [{"number": k, "count": v} for k, v in sorted(front_counts.items())],
        "back": [{"number": k, "count": v} for k, v in sorted(back_counts.items())],
    }


@app.get("/api/stats/trend")
def get_trend(
    start_season: str | None = Query(None, description="起始期号"),
    end_season: str | None = Query(None, description="截止期号"),
    limit: int | None = Query(None, ge=1, description="最近N条"),
):
    data = [_parse_numbers(d) for d in _load_data()]
    data.sort(key=lambda x: x["season"])

    if start_season:
        data = [d for d in data if d["season"] >= start_season]
    if end_season:
        data = [d for d in data if d["season"] <= end_season]
    if limit:
        data = data[-limit:]

    items = []
    for d in data:
        items.append({
            "season": d["season"],
            "pos1": d["front"][0],
            "pos2": d["front"][1],
            "pos3": d["front"][2],
            "pos4": d["front"][3],
            "pos5": d["front"][4],
            "pos6": d["back"][0],
            "pos7": d["back"][1],
        })
    return {"items": items, "total": len(items)}


@app.get("/api/check")
def check_numbers(numbers: str = Query(..., description="7个空格分隔的号码，如 '02 06 19 28 32 05 12'")):
    data = _load_data()
    results = []
    for item in data:
        if item["number"] == numbers.strip():
            results.append({
                "season": item["season"],
                "number": item["number"],
            })
    return {
        "numbers": numbers,
        "matched": len(results) > 0,
        "matches": results,
        "total_matches": len(results),
    }


@app.get("/api/stats/hot-cold")
def get_hot_cold(period: int = Query(30, ge=1)):
    data = _load_data()
    data.sort(key=lambda x: x["season"], reverse=True)
    recent = data[:period]

    front_counts: dict[int, int] = {i: 0 for i in range(1, 36)}
    back_counts: dict[int, int] = {i: 0 for i in range(1, 13)}

    for item in recent:
        parts = [int(x) for x in item["number"].split()]
        for n in parts[:5]:
            front_counts[n] = front_counts.get(n, 0) + 1
        for n in parts[5:]:
            back_counts[n] = back_counts.get(n, 0) + 1

    front_sorted = sorted(front_counts.items(), key=lambda x: x[1], reverse=True)
    back_sorted = sorted(back_counts.items(), key=lambda x: x[1], reverse=True)

    return {
        "period": period,
        "front": [{"number": k, "count": v} for k, v in front_sorted],
        "back": [{"number": k, "count": v} for k, v in back_sorted],
    }


# ---- Static file serving for production ----

_INDEX_HTML = os.path.join(FRONTEND_DIST, "index.html")

if os.path.isfile(_INDEX_HTML):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="static-assets")

    @app.get("/{path:path}")
    async def serve_spa(request: Request, path: str):
        file_path = os.path.join(FRONTEND_DIST, path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(_INDEX_HTML)
