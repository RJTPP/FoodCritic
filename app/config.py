import os
from dotenv import load_dotenv

# Fix environment
TEMPLATE_DIR = "templates"
TOKEN_EXPIRE_MINUTES = 1440  # 1 day

# Import from .env
if os.path.exists(".env"):
    load_dotenv()
else:
    raise FileNotFoundError(".env file not found")

MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")
DATABASE_USER = os.getenv("MYSQL_USER")
DATABASE_PASSWORD = os.getenv("MYSQL_PASSWORD")
DATABASE_URL = f"mysql+pymysql://{DATABASE_USER}:{DATABASE_PASSWORD}@db/{MYSQL_DATABASE}"
TOKEN_SECRET = os.getenv("TOKEN_SECRET")
TOKEN_ALGORITHM = os.getenv("TOKEN_ALGORITHM")

