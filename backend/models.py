from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    bio = Column(Text)
    city = Column(String)
    job_title = Column(String)
    salary = Column(Integer)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# NOTE: No Index on 'city' or 'email' or 'job_title'. Full table scans incoming.
