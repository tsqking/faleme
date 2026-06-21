import json
import os
import sys
from argparse import ArgumentParser
from typing import Any

import bs4
import requests

from common import utils

DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.json")
REQUEST_TIMEOUT = 30


def get_caipiao_history(force_refresh: bool = False) -> list[dict[str, Any]]:
    if not force_refresh and os.path.exists(DATA_FILE):
        with open(DATA_FILE, encoding="utf-8") as f:
            return json.load(f)

    url = "https://datachart.500star.com/dlt/history/newinc/history.php"
    params = {
        "start": "00000",  # season number lower bound
        "end": "99999",  # season number upper bound
    }

    try:
        r = requests.get(url, headers=utils.headers, params=params, timeout=REQUEST_TIMEOUT)
        r.raise_for_status()
        r.encoding = r.apparent_encoding or "utf-8"
    except requests.RequestException as e:
        print(f"网络请求失败: {e}", file=sys.stderr)
        sys.exit(1)

    soup = bs4.BeautifulSoup(r.text, "html.parser")
    tbody = soup.find("tbody")
    if tbody is None:
        print("解析失败：未找到表格数据", file=sys.stderr)
        sys.exit(1)

    trs = tbody.find_all("tr")
    data: list[dict[str, Any]] = []
    for tr in trs:
        tds = tr.find_all("td")
        if len(tds) < 8:
            continue
        data.append({
            "season": tds[0].get_text(),
            "number": f"{tds[1].get_text()} {tds[2].get_text()} {tds[3].get_text()} "
                      f"{tds[4].get_text()} {tds[5].get_text()} {tds[6].get_text()} {tds[7].get_text()}",
        })

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return data


def is_my_numbers_hit(my_number: str, force_refresh: bool = False) -> bool:
    history = get_caipiao_history(force_refresh=force_refresh)
    hit = any(item["number"] == my_number for item in history)
    if hit:
        print("你的号码已经中过一等奖了")
    else:
        print("继续坚守，您的号码还从未中过一等奖")
    return hit


def main() -> None:
    parser = ArgumentParser(description="大乐透历史开奖号码查询")
    parser.add_argument("numbers", nargs="?", default="02 06 19 28 32 05 12",
                        help="要查询的号码，格式如 '02 06 19 28 32 05 12'")
    parser.add_argument("-f", "--force-refresh", action="store_true",
                        help="强制从网络重新获取数据")
    args = parser.parse_args()
    is_my_numbers_hit(args.numbers, force_refresh=args.force_refresh)


if __name__ == "__main__":
    main()




