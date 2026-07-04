import unittest

from backend import scraper


class ScraperParsingTests(unittest.TestCase):
    def test_parse_int_handles_empty_dash_and_commas(self):
        self.assertEqual(scraper._parse_int("1,234"), 1234)
        self.assertIsNone(scraper._parse_int("-"))
        self.assertIsNone(scraper._parse_int(""))


if __name__ == "__main__":
    unittest.main()
