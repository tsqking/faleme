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
        self.temp_dir = tempfile.TemporaryDirectory()
        main.DATA_FILE = str(Path(self.temp_dir.name) / "data.json")
        main._data_cache = None

    def tearDown(self):
        main.DATA_FILE = self.original_data_file
        main._data_cache = self.original_cache
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


if __name__ == "__main__":
    unittest.main()
