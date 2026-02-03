"""
Database Creation and Initialization Script
Run this separately to create/update database schema
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'your_password_here')
}

DB_NAME = os.getenv('DB_NAME', 'trading_db')

def create_database():
    """Create database if it doesn't exist"""
    try:
        # Connect to PostgreSQL server
        conn = psycopg2.connect(**DB_CONFIG)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute(f'CREATE DATABASE {DB_NAME}')
            print(f"✅ Database '{DB_NAME}' created successfully")
        else:
            print(f"ℹ️  Database '{DB_NAME}' already exists")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

def create_tables():
    """Create all required tables"""
    try:
        # Connect to the trading database
        conn = psycopg2.connect(**DB_CONFIG, database=DB_NAME)
        cursor = conn.cursor()
        
        print("\n📊 Creating tables...")
        
        # 1. Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            )
        ''')
        print("✅ Users table created")
        
        # 2. Trade cycles table (with user_id)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS trade_cycles (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                symbol VARCHAR(50) NOT NULL,
                cycle_number INTEGER NOT NULL,
                status VARCHAR(20) NOT NULL CHECK (status IN ('OPEN', 'CLOSED')),
                buy_date DATE NOT NULL,
                buy_price DECIMAL(15, 2) NOT NULL,
                buy_rsi DECIMAL(5, 2) NOT NULL,
                sell_date DATE,
                sell_price DECIMAL(15, 2),
                sell_rsi DECIMAL(5, 2),
                highest_price_after_buy DECIMAL(15, 2) NOT NULL,
                tsl_trigger_price DECIMAL(15, 2),
                profit_loss DECIMAL(15, 2),
                profit_loss_percent DECIMAL(8, 2),
                sell_reason VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, symbol, cycle_number)
            )
        ''')
        print("✅ Trade cycles table created")
        
        # 3. Price tracking table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS price_tracking (
                id SERIAL PRIMARY KEY,
                cycle_id INTEGER NOT NULL,
                date DATE NOT NULL,
                close_price DECIMAL(15, 2) NOT NULL,
                is_new_high BOOLEAN DEFAULT FALSE,
                tsl_price DECIMAL(15, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cycle_id) REFERENCES trade_cycles(id) ON DELETE CASCADE
            )
        ''')
        print("✅ Price tracking table created")
        
        # 4. User settings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_settings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                key VARCHAR(50) NOT NULL,
                value VARCHAR(100) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, key)
            )
        ''')
        print("✅ User settings table created")
        
        # 5. Global settings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS global_settings (
                key VARCHAR(50) PRIMARY KEY,
                value VARCHAR(100) NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        print("✅ Global settings table created")
        
        # Insert default global settings
        cursor.execute('''
            INSERT INTO global_settings (key, value) 
            VALUES 
                ('default_rsi_period', '14'),
                ('default_upper_threshold', '70'),
                ('default_lower_threshold', '30'),
                ('default_tsl_percent', '5')
            ON CONFLICT (key) DO NOTHING
        ''')
        print("✅ Default settings inserted")
        
        # Create indexes for better performance
        print("\n🔍 Creating indexes...")
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_users_email 
            ON users(email)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_trade_cycles_user_id 
            ON trade_cycles(user_id)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_trade_cycles_symbol 
            ON trade_cycles(symbol)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_trade_cycles_status 
            ON trade_cycles(status)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_trade_cycles_user_symbol 
            ON trade_cycles(user_id, symbol)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_price_tracking_cycle_id 
            ON price_tracking(cycle_id)
        ''')
        
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_user_settings_user_id 
            ON user_settings(user_id)
        ''')
        
        print("✅ Indexes created")
        
        # Commit changes
        conn.commit()
        cursor.close()
        conn.close()
        
        print("\n✅ All tables created successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        return False

def drop_all_tables():
    """Drop all tables (use with caution!)"""
    try:
        conn = psycopg2.connect(**DB_CONFIG, database=DB_NAME)
        cursor = conn.cursor()
        
        print("\n⚠️  WARNING: Dropping all tables...")
        
        cursor.execute('DROP TABLE IF EXISTS price_tracking CASCADE')
        cursor.execute('DROP TABLE IF EXISTS trade_cycles CASCADE')
        cursor.execute('DROP TABLE IF EXISTS user_settings CASCADE')
        cursor.execute('DROP TABLE IF EXISTS global_settings CASCADE')
        cursor.execute('DROP TABLE IF EXISTS users CASCADE')
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("✅ All tables dropped")
        return True
        
    except Exception as e:
        print(f"❌ Error dropping tables: {e}")
        return False

def reset_database():
    """Drop and recreate all tables"""
    print("="*80)
    print("🔄 RESETTING DATABASE")
    print("="*80)
    
    if drop_all_tables():
        return create_tables()
    return False

def show_table_info():
    """Display information about all tables"""
    try:
        conn = psycopg2.connect(**DB_CONFIG, database=DB_NAME)
        cursor = conn.cursor()
        
        print("\n📊 DATABASE INFORMATION")
        print("="*80)
        
        # List all tables
        cursor.execute('''
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        ''')
        
        tables = cursor.fetchall()
        print(f"\n📋 Tables ({len(tables)}):")
        for table in tables:
            print(f"  • {table[0]}")
            
            # Count records in each table
            cursor.execute(f'SELECT COUNT(*) FROM {table[0]}')
            count = cursor.fetchone()[0]
            print(f"    Records: {count}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Main execution"""
    print("\n" + "="*80)
    print("🗄️  DATABASE INITIALIZATION SCRIPT")
    print("="*80)
    
    print(f"\nConfiguration:")
    print(f"  Host: {DB_CONFIG['host']}")
    print(f"  Port: {DB_CONFIG['port']}")
    print(f"  Database: {DB_NAME}")
    print(f"  User: {DB_CONFIG['user']}")
    
    print("\n" + "="*80)
    print("OPTIONS:")
    print("="*80)
    print("1. Create database and tables (fresh install)")
    print("2. Create tables only (database exists)")
    print("3. Reset database (drop and recreate)")
    print("4. Show database info")
    print("5. Exit")
    print("="*80)
    
    choice = input("\nEnter your choice (1-5): ").strip()
    
    if choice == '1':
        print("\n🚀 Creating database and tables...")
        if create_database():
            create_tables()
    
    elif choice == '2':
        print("\n🚀 Creating tables...")
        create_tables()
    
    elif choice == '3':
        confirm = input("\n⚠️  This will delete ALL data. Type 'YES' to confirm: ")
        if confirm == 'YES':
            reset_database()
        else:
            print("❌ Cancelled")
    
    elif choice == '4':
        show_table_info()
    
    elif choice == '5':
        print("\n👋 Goodbye!")
        return
    
    else:
        print("\n❌ Invalid choice")
        return
    
    print("\n✅ Done!")
    print("="*80)

if __name__ == '__main__':
    main()