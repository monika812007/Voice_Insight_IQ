from sqlalchemy import inspect, text


def migrate_schema(engine) -> None:
    """Apply additive SQLite-compatible columns without dropping existing data."""
    inspector = inspect(engine)
    additions = {
        "products": {
            "normalized_title": "VARCHAR",
            "product_identifier": "VARCHAR",
            "updated_at": "DATETIME",
        },
        "platforms": {
            "domain": "VARCHAR",
            "created_at": "DATETIME",
            "updated_at": "DATETIME",
        },
    }
    with engine.begin() as connection:
        for table, columns in additions.items():
            existing = {column["name"] for column in inspector.get_columns(table)}
            for name, definition in columns.items():
                if name not in existing:
                    connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {definition}"))