import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT'),
    'database': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD')
}

try:
    # Connect to Supabase Postgres
    conn = psycopg2.connect(
        host=DB_CONFIG['host'],
        port=DB_CONFIG['port'],
        database=DB_CONFIG['database'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        cursor_factory=RealDictCursor
    )
    cursor = conn.cursor()
    cursor.execute("SELECT NOW() as current_time;")
    result = cursor.fetchone()
    print("✅ Connection successful! Current DB time:", result['current_time'])
    cursor.close()
    conn.close()
except Exception as e:
    print("❌ Connection failed:", e)
