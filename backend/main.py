import json
import os
from typing import Any

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from backend.scraper import refresh_data

app = FastAPI(title="大乐透数据 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data.json")


@app.on_event("startup")
def startup():
    if not os.path.exists(DATA_FILE):
        print("data.json 不存在，正在从网络获取...")
        refresh_data()
        print("数据获取完成")
    else:
        print("使用本地缓存 data.json")


def _load_data() -> list[dict[str, Any]]:
    with open(DATA_FILE, encoding="utf-8") as f:
        return json.load(f)


def _parse_numbers(item: dict[str, Any]) -> dict[str, Any]:
    parts = item["number"].split()
    return {
        "season": item["season"],
        "front": [int(x) for x in parts[:5]],
        "back": [int(x) for x in parts[5:]],
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
def get_trend():
    data = [_parse_numbers(d) for d in _load_data()]
    data.sort(key=lambda x: x["season"])
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

    front_counts: dict[int, int] = {}
    back_counts: dict[int, int] = {}

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
