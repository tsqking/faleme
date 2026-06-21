from os import utime

import requests
import bs4
from common import utils

def get_caipiao_history():
    url = "https://datachart.500star.com/dlt/history/newinc/history.php"
    param = {
        "start": "00000",
        "end": "99999"
    }

    r = requests.get(url, headers=utils.headers, params=param)
    soup = bs4.BeautifulSoup(r.text, "html.parser")
    trs = soup.find("tbody").find_all("tr")
    datas = []
    for tr in trs:
        tds = tr.find_all("td")
        datas.append({
            "season": tds[0].get_text(),
            "number": f"{tds[1].get_text()} {tds[2].get_text()} {tds[3].get_text()} {tds[4].get_text()} {tds[5].get_text()} {tds[6].get_text()} {tds[7].get_text()}",
        })

    # print(datas)
    # import os
    # os.remove('data.json')
    import json
    with open("data.json", "w", encoding="utf-8") as f:
      json.dump(datas, f, indent=2, ensure_ascii=False)

    return datas

def is_my_numbers_hit():
    dts = get_caipiao_history()
    my_number = "02 06 19 28 32 05 12"
    # my_number = '09 10 12 23 26 02 03'
    hit = any(item["number"] == my_number for item in dts)
    if hit:
        print("你的号码已经中过一等奖了")
    else:
        print("继续坚守，您的号码还从未中过一等奖")

is_my_numbers_hit()




