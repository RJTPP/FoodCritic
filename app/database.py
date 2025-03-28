from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from config import DATABASE_URL


# Create database engine
engine = create_engine(DATABASE_URL)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define base class for models
Base = declarative_base()

# Get database session
def get_db():
    db = SessionLocal()
    try:
        yield db  
    except Exception as e:
        db.rollback()  
        raise HTTPException(status_code=500, detail=f"Database error {e}")
    finally:
        db.close()


def test_db_connection(raise_exception=False):
    try:
        with engine.connect() as conn:
            return True
    except Exception as e:
        if raise_exception:
            raise e
        return False