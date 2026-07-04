import json
import os
import sys
from datetime import date
from typing import Any

import bs4
import requests

from common import utils

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.json")
REQUEST_TIMEOUT = 30


def _parse_int(text: str) -> int:
    return int(text.replace(",", ""))

def refresh_data() -> list[dict[str, Any]]:
    url = "https://datachart.500star.com/dlt/history/newinc/history.php"
    params = {
        "start": "00000",
        "end": "99999",
    }

    try:
        r = requests.get(url, headers=utils.headers, params=params, timeout=REQUEST_TIMEOUT)
        r.raise_for_status()
        r.encoding = r.apparent_encoding or "utf-8"
    except requests.RequestException as e:
        print(f"网络请求失败: {e}", file=sys.stderr)
        raise

    soup = bs4.BeautifulSoup(r.text, "html.parser")
    tbody = soup.find("tbody")
    if tbody is None:
        raise RuntimeError("解析失败：未找到表格数据")

    trs = tbody.find_all("tr")
    data: list[dict[str, Any]] = []
    for tr in trs:
        tds = tr.find_all("td")
        if len(tds) < 15:
            continue
        data.append({
            "season": tds[0].get_text(strip=True),
            "number": f"{tds[1].get_text(strip=True)} {tds[2].get_text(strip=True)} {tds[3].get_text(strip=True)} "
                      f"{tds[4].get_text(strip=True)} {tds[5].get_text(strip=True)} "
                      f"{tds[6].get_text(strip=True)} {tds[7].get_text(strip=True)}",
            "pool": _parse_int(tds[8].get_text(strip=True)),
            "first_prize_count": int(tds[9].get_text(strip=True)),
            "first_prize_amount": _parse_int(tds[10].get_text(strip=True)),
            "second_prize_count": int(tds[11].get_text(strip=True)),
            "second_prize_amount": _parse_int(tds[12].get_text(strip=True)),
            "total_bets": _parse_int(tds[13].get_text(strip=True)),
            "draw_date": tds[14].get_text(strip=True),
        })

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump({
            "_fetched_date": date.today().isoformat(),
            "data": data,
        }, f, indent=2, ensure_ascii=False)

    return data
