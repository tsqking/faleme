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
