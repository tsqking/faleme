from typing import Any


PRIZE_RULES: dict[tuple[int, int], dict[str, Any]] = {
    (5, 2): {"tier": 1, "fixed": None},
    (5, 1): {"tier": 2, "fixed": None},
    (4, 2): {"tier": 4, "fixed": 3000},
    (4, 1): {"tier": 5, "fixed": 300},
    (3, 2): {"tier": 6, "fixed": 200},
    (4, 0): {"tier": 7, "fixed": 100},
    (3, 1): {"tier": 8, "fixed": 15},
    (2, 2): {"tier": 8, "fixed": 15},
    (1, 2): {"tier": 8, "fixed": 15},
    (3, 0): {"tier": 9, "fixed": 5},
    (2, 1): {"tier": 9, "fixed": 5},
    (1, 1): {"tier": 9, "fixed": 5},
    (0, 2): {"tier": 9, "fixed": 5},
    (5, 0): {"tier": 3, "fixed": 10000},
}


def evaluate(front_hit: int, back_hit: int) -> dict[str, Any] | None:
    rule = PRIZE_RULES.get((front_hit, back_hit))
    if rule is None:
        return None
    return {
        "tier": rule["tier"],
        "is_float": rule["fixed"] is None,
        "fixed": rule["fixed"],
    }
