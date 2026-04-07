import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from models import Base, User
from faker import Faker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

SEED_COUNT = 100000
BATCH_SIZE = 5000
faker = Faker()

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print(f"Seeding {SEED_COUNT} users...")
        for i in range(SEED_COUNT // BATCH_SIZE):
            users = [
                User(
                    name=faker.name(),
                    email=faker.email(),
                    age=faker.random_int(18, 80),
                    bio=faker.paragraph(),
                    city=faker.city(),
                    job_title=faker.job(),
                    salary=faker.random_int(30000, 200000)
                )
                for _ in range(BATCH_SIZE)
            ]
            session.add_all(users)
            await session.commit()
            print(f"Batch {i+1}/{(SEED_COUNT // BATCH_SIZE)} committed.")
    
    print("Seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed())
