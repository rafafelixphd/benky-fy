# scripts/seed.py
import csv
from datetime import datetime
from pathlib import Path

from ...logger import get_logger
from ...models import User, UserSession
from .dashboard_seed import seed_user_8_anki_test, seed_user_progress
from .words_seed import seed_words

logger = get_logger()

BASE_DIR = Path(__file__).parent.parent.parent.parent
DATA_DIR = BASE_DIR / "seed/data"

logger.info(f"Seeding data from {DATA_DIR}")
# Table-name → Model mapping
MODEL_REGISTRY = {
    "users": User,
    "user_sessions": UserSession,
}


def parse_dt(value):
    if not value:
        return None
    if value.endswith("Z"):
        value = value[:-1]
    return datetime.fromisoformat(value)


def load_csv_to_dicts(path: Path):
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [dict(row) for row in reader]


def normalize_row(model, row: dict):
    """Convert strings to correct field types dynamically."""
    data = {}
    for col, val in row.items():
        if val == "":
            val = None

        # infer datetime
        if hasattr(model, col):
            column = getattr(model, col)
            col_type = str(column.type).upper()  # Get the string representation of the column type and upper it
        else:
            data[col] = val
            continue

        if "DATETIME" in col_type and val is not None:
            data[col] = parse_dt(val)
        elif "INTEGER" in col_type and val is not None:
            data[col] = int(val)
        elif "BOOLEAN" in col_type and val is not None:
            data[col] = str(val).lower() in ("true", "1", "t", "yes")
        else:
            data[col] = val

    return data


def seed_table(table_name, model, csv_path, db):
    logger.info(f"\tSeeding table {table_name} from {csv_path}...")
    rows = load_csv_to_dicts(csv_path)
    objs = []
    for row in rows:
        data = normalize_row(model, row)

        # idempotency: skip if unique value already exists
        unique_field = "id" if "id" in data else None
        if unique_field:
            exists = model.query.get(data["id"])
            if exists:
                continue

        objs.append(model(**data))

    if objs:
        db.session.bulk_save_objects(objs)
        db.session.commit()
        print(f"Seeded {len(objs)} rows into {table_name}")

        # Reset ID sequence for Postgres
        if hasattr(model, "id"):
            # For Postgres only: reset sequence to max(id) + 1
            try:
                db.session.execute(
                    db.text(
                        f"SELECT setval(pg_get_serial_sequence(\
                            '{table_name}', 'id'), coalesce(max(id),0) + 1, false) \
                        FROM {table_name};"
                    )
                )
                db.session.commit()
            except Exception as e:
                logger.warning(f"Could not reset sequence for {table_name}: {e}")
    else:
        print(f"No new rows to seed for {table_name}")


def init_seed_database(app, db):
    if not app.config.get("ENABLE_DB_SEED", False):
        logger.info("Database seeding is disabled. Skipping...")
        return
    logger.info("Seeding database...")
    with app.app_context():
        for file in DATA_DIR.glob("*.csv"):
            table_name = file.stem  # users.csv → "users"
            model = MODEL_REGISTRY.get(table_name)

            if not model:
                print(f"Skipping {file.name}: no model registered")
                continue

            seed_table(table_name, model, file, db)

        # 2. Seed Words from JSON
        seed_words(app, db)
        seed_user_progress(app, db)
        seed_user_8_anki_test(app, db)

    logger.info("Complete database...")
