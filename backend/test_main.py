import json
import tempfile
import unittest
from pathlib import Path

from backend import main


def make_draw(season: str, number: str = "02 06 19 28 32 05 12"):
    return {
        "season": season,
        "number": number,
        "pool": None,
        "first_prize_count": None,
        "first_prize_amount": None,
        "second_prize_count": None,
        "second_prize_amount": None,
        "total_bets": None,
        "draw_date": None,
    }


class MainApiTests(unittest.TestCase):
    def setUp(self):
        self.original_data_file = main.DATA_FILE
        self.original_cache = main._data_cache
        self.original_index = main._index_cache
        self.temp_dir = tempfile.TemporaryDirectory()
        main.DATA_FILE = str(Path(self.temp_dir.name) / "data.json")
        main._data_cache = None
        main._index_cache = None

    def tearDown(self):
        main.DATA_FILE = self.original_data_file
        main._data_cache = self.original_cache
        main._index_cache = self.original_index
        self.temp_dir.cleanup()

    def write_data(self, items):
        Path(main.DATA_FILE).write_text(json.dumps({"data": items}), encoding="utf-8")

    def test_invalidate_data_cache_reloads_updated_file(self):
        self.write_data([make_draw("001")])
        self.assertEqual(main._load_data()[0]["season"], "001")

        self.write_data([make_draw("002")])
        main._invalidate_data_cache()

        self.assertEqual(main._load_data()[0]["season"], "002")

    def test_hot_cold_does_not_mutate_cached_data_order(self):
        items = [make_draw("001"), make_draw("002")]
        self.write_data(items)

        main.get_hot_cold(1)

        self.assertEqual([item["season"] for item in main._load_data()], ["001", "002"])

    def test_check_numbers_accepts_unpadded_user_input(self):
        self.write_data([make_draw("001")])

        result = main.check_numbers("2 6 19 28 32 5 12")

        self.assertTrue(result["matched"])

    def test_check_numbers_invalid_input_returns_unmatched(self):
        self.write_data([make_draw("001")])

        result = main.check_numbers("not numbers")

        self.assertFalse(result["matched"])
        self.assertEqual(result["total_matches"], 0)

    def test_frequency_counts_front_and_back(self):
        self.write_data(
            [
                make_draw("001", "01 02 03 04 05 06 07"),
                make_draw("002", "01 02 03 04 05 06 07"),
            ]
        )

        result = main.get_frequency()

        front_by_num = {f["number"]: f["count"] for f in result["front"]}
        back_by_num = {b["number"]: b["count"] for b in result["back"]}
        self.assertEqual(front_by_num[1], 2)
        self.assertEqual(back_by_num[6], 2)

    def test_trend_returns_positions_in_order(self):
        self.write_data([make_draw("001", "01 02 03 04 05 06 07")])

        result = main.get_trend(start_season=None, end_season=None, limit=None)

        self.assertEqual(result["total"], 1)
        item = result["items"][0]
        self.assertEqual(item["pos1"], 1)
        self.assertEqual(item["pos5"], 5)
        self.assertEqual(item["pos6"], 6)
        self.assertEqual(item["pos7"], 7)

    def test_trend_range_filters_by_numeric_season(self):
        self.write_data(
            [
                make_draw("25001", "01 02 03 04 05 06 07"),
                make_draw("25002", "01 02 03 04 05 06 07"),
                make_draw("25003", "01 02 03 04 05 06 07"),
            ]
        )

        result = main.get_trend(start_season="2", end_season=None, limit=None)

        self.assertEqual([d["season"] for d in result["items"]], ["25001", "25002", "25003"])

    def test_frequency_skips_malformed_rows(self):
        items = [
            make_draw("001", "01 02 03 04 05 06 07"),
            {"season": "002", "number": "only three"},
        ]
        self.write_data(items)

        result = main.get_frequency()

        front_by_num = {f["number"]: f["count"] for f in result["front"]}
        self.assertEqual(front_by_num[1], 1)

    def test_hot_cold_counts_only_valid_rows_toward_period(self):
        items = [
            make_draw("001", "01 02 03 04 05 06 07"),
            {"season": "002", "number": "bad"},
            make_draw("003", "01 02 03 04 05 06 07"),
        ]
        self.write_data(items)

        result = main.get_hot_cold(period=3)

        front_by_num = {f["number"]: f["count"] for f in result["front"]}
        self.assertEqual(front_by_num[1], 2)

    def test_health_returns_ok(self):
        self.write_data([make_draw("001")])

        result = main.health()

        self.assertEqual(result, {"status": "ok"})

    def test_check_prize_third_prize(self):
        self.write_data(
            [
                make_draw("001", "01 02 03 04 05 06 07"),
                make_draw("002", "02 06 19 28 32 05 12"),
            ]
        )

        result = main.check_prize(numbers="02 06 19 28 32 01 02")

        self.assertTrue(result["matched"])
        self.assertEqual(result["tier"], 3)
        self.assertFalse(result["is_float"])
        self.assertEqual(result["amount"], 10000)
        self.assertEqual(result["front_hit"], 5)
        self.assertEqual(result["back_hit"], 0)
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


if __name__ == "__main__":
    unittest.main()
