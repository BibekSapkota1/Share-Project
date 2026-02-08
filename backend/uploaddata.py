# import psycopg2
# import csv

# DB_CONFIG = {
#     "host": "localhost",
#     "port": 5432,
#     "database": "trading_db",
#     "user": "postgres",
#     "password": "123"
# }

# CSV_FILE = "/Users/bibeksapkota/Desktop/Project Main/backend/data/Sectors&Symbols.csv"

# conn = psycopg2.connect(**DB_CONFIG)
# cur = conn.cursor()

# with open(CSV_FILE, newline='', encoding='utf-8') as f:
#     reader = csv.DictReader(f)
#     for row in reader:
#         cur.execute("""
#             INSERT INTO sectors (sector_name, symbol, max_positions, created_at)
#             VALUES (%s, %s, %s, %s)
#             ON CONFLICT DO NOTHING
#         """, (
#             row['Sector_name'],
#             row['Symbol'],
#             row['max_positions'],
#             row['created_at']
#         ))

# conn.commit()
# cur.close()
# conn.close()

# print("✅ CSV uploaded successfully")
