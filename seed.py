"""
Seed script — populates the database with random financial records and a default admin user.

Usage:
    python seed.py              # seeds 100 records
    python seed.py --count 500  # seeds 500 records
"""

import argparse
import random
from datetime import date, timedelta

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models.financial import CategoryEnum, FinancialRecord, RecordType
from app.models.user import RoleEnum, User
from app.services.auth import AuthService

# Categories that make sense per record type
INCOME_CATEGORIES = [
    CategoryEnum.SALARY,
    CategoryEnum.FREELANCE,
    CategoryEnum.INVESTMENT,
    CategoryEnum.OTHER,
]

EXPENSE_CATEGORIES = [
    CategoryEnum.RENT,
    CategoryEnum.UTILITIES,
    CategoryEnum.GROCERIES,
    CategoryEnum.TRANSPORT,
    CategoryEnum.ENTERTAINMENT,
    CategoryEnum.HEALTHCARE,
    CategoryEnum.EDUCATION,
    CategoryEnum.SHOPPING,
    CategoryEnum.FOOD_DINING,
    CategoryEnum.INSURANCE,
    CategoryEnum.TAXES,
    CategoryEnum.OTHER,
]

DESCRIPTIONS = {
    CategoryEnum.SALARY: ["Monthly salary", "Bonus payout", "Overtime pay"],
    CategoryEnum.FREELANCE: ["Web dev project", "Consulting fee", "Design work"],
    CategoryEnum.INVESTMENT: ["Stock dividend", "Mutual fund returns", "Crypto gain"],
    CategoryEnum.RENT: ["Monthly rent", "Office space rent"],
    CategoryEnum.UTILITIES: ["Electricity bill", "Water bill", "Internet bill", "Gas bill"],
    CategoryEnum.GROCERIES: ["Weekly groceries", "Supermarket run", "Organic store"],
    CategoryEnum.TRANSPORT: ["Fuel", "Uber ride", "Metro pass", "Car maintenance"],
    CategoryEnum.ENTERTAINMENT: ["Netflix subscription", "Movie tickets", "Concert tickets"],
    CategoryEnum.HEALTHCARE: ["Doctor visit", "Pharmacy", "Lab tests", "Insurance copay"],
    CategoryEnum.EDUCATION: ["Online course", "Books", "Workshop fee"],
    CategoryEnum.SHOPPING: ["Clothing", "Electronics", "Home decor"],
    CategoryEnum.FOOD_DINING: ["Restaurant dinner", "Cafe", "Food delivery"],
    CategoryEnum.INSURANCE: ["Health insurance", "Car insurance", "Life insurance"],
    CategoryEnum.TAXES: ["Income tax", "Property tax", "GST payment"],
    CategoryEnum.OTHER: ["Miscellaneous", "Gift", "Donation", "Subscription"],
}


def create_default_users(db):
    """Create one user per role if they don't already exist."""
    defaults = [
        ("admin", "admin@finops.com", "admin123", "Admin User", RoleEnum.ADMIN),
        ("analyst", "analyst@finops.com", "analyst123", "Analyst User", RoleEnum.ANALYST),
        ("viewer", "viewer@finops.com", "viewer123", "Viewer User", RoleEnum.VIEWER),
    ]
    user_ids = []
    for username, email, password, full_name, role in defaults:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            user = User(
                username=username,
                email=email,
                hashed_password=AuthService.hash_password(password),
                full_name=full_name,
                role=role,
            )
            db.add(user)
            db.flush()
            print(f"  Created user: {username} (role={role.value}, password={password})")
        else:
            print(f"  User already exists: {username}")
        user_ids.append(user.id)
    return user_ids


def generate_records(count: int, creator_ids: list[int]) -> list[FinancialRecord]:
    """Generate random financial records."""
    records = []
    today = date.today()

    for _ in range(count):
        rec_type = random.choice(list(RecordType))

        if rec_type == RecordType.INCOME:
            category = random.choice(INCOME_CATEGORIES)
            amount = round(random.uniform(1000, 50000), 2)
        else:
            category = random.choice(EXPENSE_CATEGORIES)
            amount = round(random.uniform(50, 10000), 2)

        random_date = today - timedelta(days=random.randint(0, 365))
        description = random.choice(DESCRIPTIONS.get(category, ["No description"]))

        records.append(
            FinancialRecord(
                amount=amount,
                type=rec_type,
                category=category,
                date=random_date,
                description=description,
                created_by=random.choice(creator_ids),
            )
        )
    return records


def seed(count: int):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Creating default users...")
        user_ids = create_default_users(db)
        db.commit()

        print(f"Generating {count} random financial records...")
        records = generate_records(count, user_ids)
        db.add_all(records)
        db.commit()
        print(f"Done! Inserted {count} records.")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the FinOps database")
    parser.add_argument("--count", type=int, default=100, help="Number of records to generate")
    args = parser.parse_args()
    seed(args.count)
