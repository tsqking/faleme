import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from backend import scraper


class ScraperParsingTests(unittest.TestCase):
    def setUp(self):
        self.original_data_file = scraper.DATA_FILE
        self.temp_dir = tempfile.TemporaryDirectory()
        scraper.DATA_FILE = str(Path(self.temp_dir.name) / "data.json")

    def tearDown(self):
        scraper.DATA_FILE = self.original_data_file
        self.temp_dir.cleanup()

    def test_parse_int_handles_empty_dash_and_commas(self):
        self.assertEqual(scraper._parse_int("1,234"), 1234)
        self.assertIsNone(scraper._parse_int("-"))
        self.assertIsNone(scraper._parse_int(""))

    def test_parse_int_returns_none_for_non_numeric(self):
        self.assertIsNone(scraper._parse_int("暂无"))
        self.assertIsNone(scraper._parse_int("abc"))

    def test_refresh_data_parses_html(self):
        html = (
            "<table><tbody>"
            "<tr>"
            "<td>24001</td><td>02</td><td>06</td><td>19</td><td>28</td><td>32</td>"
            "<td>05</td><td>12</td>"
            "<td>1,000,000</td><td>3</td><td>10,000,000</td>"
            "<td>10</td><td>5,000,000</td><td>100,000</td><td>2024-01-01</td>"
            "</tr>"
            "<tr><td colspan=\"15\">-</td></tr>"
            "</tbody></table>"
        )
        mock_resp = mock.MagicMock()
        mock_resp.text = html
        mock_resp.apparent_encoding = "utf-8"
        mock_resp.raise_for_status.return_value = None
        with mock.patch("backend.scraper.requests.get", return_value=mock_resp):
            data = scraper.refresh_data()

        self.assertEqual(len(data), 1)
        row = data[0]
        self.assertEqual(row["season"], "24001")
        self.assertEqual(row["number"], "02 06 19 28 32 05 12")
        self.assertEqual(row["pool"], 1000000)
        self.assertEqual(row["first_prize_count"], 3)
        self.assertEqual(row["first_prize_amount"], 10000000)
        self.assertEqual(row["draw_date"], "2024-01-01")

        saved = json.loads(Path(scraper.DATA_FILE).read_text(encoding="utf-8"))
        self.assertEqual(saved["data"][0]["season"], "24001")
        self.assertIn("_fetched_date", saved)


if __name__ == "__main__":
    unittest.main()
