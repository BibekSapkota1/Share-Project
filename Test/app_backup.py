# """
# Flask server for Stock Market RSI Analysis with PostgreSQL Database
# Features:
# - User Authentication (Email/Password)
# - User-specific data isolation
# - Market Scanner with TSL logic
# - Turnover filtering (top 15 for 2 consecutive days)
# - Trade Cycle Tracking with 5% TSL
# - Manual sell with reason tracking
# - Auto-sell when price drops below TSL OR RSI < lower threshold
# """

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import pandas as pd
# import numpy as np
# from datetime import datetime, timedelta
# import os
# import psycopg2
# from psycopg2 import pool
# from psycopg2.extras import RealDictCursor
# from contextlib import contextmanager
# from dotenv import load_dotenv
# import bcrypt
# import jwt
# from functools import wraps

# load_dotenv()

# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}})

# app.config['DEBUG'] = True
# app.config['ENV'] = 'development'

# DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'data_sample.csv')
# JWT_SECRET = os.getenv('JWT_SECRET_KEY', 'your-super-secret-key-change-this-in-production')

# DB_CONFIG = {
#     'host': os.getenv('DB_HOST', 'localhost'),
#     'port': os.getenv('DB_PORT', '5432'),
#     'database': os.getenv('DB_NAME', 'trading_db'),
#     'user': os.getenv('DB_USER', 'postgres'),
#     'password': os.getenv('DB_PASSWORD', 'your_password_here'),
#    # 'sslmode': 'require'
# }

# # DB_CONFIG = {
# #     'host': 'aws-1-ap-south-1.pooler.supabase.com',
# #     'port': '6543',
# #     'database': 'postgres',
# #     'user': 'postgres.kwwwmblzzugunwxirdbr',
# #     'password': 'sS5QKVH92uJkT3vg',
# #     'sslmode': 'require'
# # }


# connection_pool = None

# def init_connection_pool():
#     global connection_pool
#     try:
#         connection_pool = psycopg2.pool.SimpleConnectionPool(1, 20, **DB_CONFIG)
#         if connection_pool:
#             print("✅ PostgreSQL connection pool created successfully")
#             return True
#     except Exception as e:
#         print(f"❌ Error creating connection pool: {e}")
#         return False

# @contextmanager
# def get_db():
#     conn = None
#     try:
#         conn = connection_pool.getconn()
#         conn.autocommit = False
#         cursor = conn.cursor(cursor_factory=RealDictCursor)
#         yield cursor
#         conn.commit()
#     except Exception as e:
#         if conn:
#             conn.rollback()
#         raise e
#     finally:
#         if conn:
#             cursor.close()
#             connection_pool.putconn(conn)

# # ============================================================================
# # AUTHENTICATION HELPERS
# # ============================================================================

# def hash_password(password):
#     return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# def verify_password(password, password_hash):
#     return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

# def create_token(user_id, email):
#     payload = {
#         'user_id': user_id,
#         'email': email,
#         'exp': datetime.utcnow() + timedelta(days=7)
#     }
#     return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

# def verify_token(token):
#     try:
#         payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
#         return payload['user_id']
#     except:
#         return None

# def token_required(f):
#     @wraps(f)
#     def decorated(*args, **kwargs):
#         if request.method == 'OPTIONS':
#             return '', 204
#         auth_header = request.headers.get('Authorization')
#         if not auth_header:
#             return jsonify({'error': 'Token is missing'}), 401
#         token = auth_header.split(" ")[1] if " " in auth_header else auth_header
#         user_id = verify_token(token)
#         if not user_id:
#             return jsonify({'error': 'Token is invalid'}), 401
#         return f(user_id, *args, **kwargs)
#     return decorated

# # ============================================================================
# # UTILITY FUNCTIONS
# # ============================================================================

# def clean_numeric_value(value):
#     if isinstance(value, str):
#         return float(value.replace(',', ''))
#     return float(value)

# def calculate_rsi(prices, period=14):
#     if len(prices) < period + 1:
#         return pd.Series([np.nan] * len(prices), index=prices.index)
#     delta = prices.diff()
#     gains = delta.where(delta > 0, 0)
#     losses = -delta.where(delta < 0, 0)
#     avg_gain = gains.rolling(window=period, min_periods=period).mean()
#     avg_loss = losses.rolling(window=period, min_periods=period).mean()
#     avg_gain = avg_gain.copy()
#     avg_loss = avg_loss.copy()
#     if len(gains) > period:
#         for i in range(period, len(gains)):
#             if pd.notna(avg_gain.iloc[i-1]) and pd.notna(avg_loss.iloc[i-1]):
#                 avg_gain.iloc[i] = (avg_gain.iloc[i-1] * (period - 1) + gains.iloc[i]) / period
#                 avg_loss.iloc[i] = (avg_loss.iloc[i-1] * (period - 1) + losses.iloc[i]) / period
#     rs = avg_gain / avg_loss.replace(0, np.nan)
#     rsi = 100 - (100 / (1 + rs))
#     return rsi

# def get_top_turnover_symbols(df, date, top_n=15):
#     date_data = df[df['Date'] == date].copy()
#     if 'Turnover' in date_data.columns:
#         date_data['calculated_turnover'] = date_data['Turnover'].apply(clean_numeric_value)
#     else:
#         date_data['calculated_turnover'] = (
#             date_data['Volume'].apply(clean_numeric_value) * 
#             date_data['Close'].apply(clean_numeric_value)
#         )
#     top_symbols = date_data.nlargest(top_n, 'calculated_turnover')['Symbol'].tolist()
#     return set(top_symbols)

# def check_turnover_eligibility(symbol, date_str):
#     try:
#         df = pd.read_csv(DATA_FILE)
#         df['Symbol'] = df['Symbol'].astype(str).str.strip()
#         df = df[df['Symbol'].notna() & (df['Symbol'] != 'nan') & (df['Symbol'] != '')]
#         df['Date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y', errors='coerce')
#         df = df.dropna(subset=['Date'])
#         df = df.sort_values('Date')
#         current_date = pd.to_datetime(date_str, format='%Y-%m-%d')
#         unique_dates = sorted(df['Date'].unique())
#         current_date_idx = None
#         for idx, d in enumerate(unique_dates):
#             if d == current_date:
#                 current_date_idx = idx
#                 break
#         if current_date_idx is None or current_date_idx < 2:
#             return False
#         day_1 = unique_dates[current_date_idx - 1]
#         day_2 = unique_dates[current_date_idx - 2]
#         top_day_1 = get_top_turnover_symbols(df, day_1, 15)
#         top_day_2 = get_top_turnover_symbols(df, day_2, 15)
#         return symbol in top_day_1 and symbol in top_day_2
#     except Exception as e:
#         print(f"Error checking turnover eligibility for {symbol}: {e}")
#         return False

# # ============================================================================
# # DATABASE FUNCTIONS
# # ============================================================================

# def get_next_cycle_number(user_id, symbol):
#     with get_db() as cursor:
#         cursor.execute('''
#             SELECT MAX(cycle_number) as max_cycle 
#             FROM trade_cycles 
#             WHERE user_id = %s AND symbol = %s
#         ''', (user_id, symbol))
#         result = cursor.fetchone()
#         return (result['max_cycle'] or 0) + 1

# def get_open_cycle(user_id, symbol):
#     with get_db() as cursor:
#         cursor.execute('''
#             SELECT * FROM trade_cycles 
#             WHERE user_id = %s AND symbol = %s AND status = 'OPEN'
#             ORDER BY cycle_number DESC
#             LIMIT 1
#         ''', (user_id, symbol))
#         result = cursor.fetchone()
#         return dict(result) if result else None

# def create_buy_cycle(user_id, symbol, date, price, rsi):
#     cycle_number = get_next_cycle_number(user_id, symbol)
#     with get_db() as cursor:
#         cursor.execute('''
#             INSERT INTO trade_cycles (
#                 user_id, symbol, cycle_number, status, buy_date, buy_price, buy_rsi,
#                 highest_price_after_buy, tsl_trigger_price
#             ) VALUES (%s, %s, %s, 'OPEN', %s, %s, %s, %s, %s)
#             RETURNING id
#         ''', (user_id, symbol, cycle_number, date, price, rsi, price, price * 0.95))
#         cycle_id = cursor.fetchone()['id']
#         cursor.execute('''
#             INSERT INTO price_tracking (cycle_id, date, close_price, tsl_price, is_new_high)
#             VALUES (%s, %s, %s, %s, %s)
#         ''', (cycle_id, date, price, price * 0.95, True))
#         return cycle_number

# def update_tsl(cycle_id, date, current_price):
#     with get_db() as cursor:
#         cursor.execute('''
#             SELECT highest_price_after_buy, tsl_trigger_price 
#             FROM trade_cycles 
#             WHERE id = %s
#         ''', (cycle_id,))
#         result = cursor.fetchone()
#         highest_price = float(result['highest_price_after_buy'])
#         current_tsl = float(result['tsl_trigger_price'])
#         is_new_high = False
#         if current_price > highest_price:
#             highest_price = current_price
#             current_tsl = current_price * 0.95
#             is_new_high = True
#             cursor.execute('''
#                 UPDATE trade_cycles 
#                 SET highest_price_after_buy = %s, 
#                     tsl_trigger_price = %s,
#                     updated_at = CURRENT_TIMESTAMP
#                 WHERE id = %s
#             ''', (highest_price, current_tsl, cycle_id))
#         cursor.execute('''
#             INSERT INTO price_tracking (cycle_id, date, close_price, tsl_price, is_new_high)
#             VALUES (%s, %s, %s, %s, %s)
#         ''', (cycle_id, date, current_price, current_tsl, is_new_high))
#         return current_tsl, is_new_high

# def close_cycle(cycle_id, date, price, rsi, reason='AUTOMATIC'):
#     with get_db() as cursor:
#         cursor.execute('SELECT buy_price FROM trade_cycles WHERE id = %s', (cycle_id,))
#         result = cursor.fetchone()
#         buy_price = float(result['buy_price'])
#         profit_loss = price - buy_price
#         profit_loss_percent = ((price - buy_price) / buy_price) * 100
#         cursor.execute('''
#             UPDATE trade_cycles 
#             SET status = 'CLOSED',
#                 sell_date = %s,
#                 sell_price = %s,
#                 sell_rsi = %s,
#                 profit_loss = %s,
#                 profit_loss_percent = %s,
#                 sell_reason = %s,
#                 updated_at = CURRENT_TIMESTAMP
#             WHERE id = %s
#         ''', (date, price, rsi, profit_loss, profit_loss_percent, reason, cycle_id))
#         return profit_loss, profit_loss_percent

# def scan_all_symbols(user_id, upper_threshold=70, lower_threshold=30, rsi_period=14):
#     if not os.path.exists(DATA_FILE):
#         return []
#     df = pd.read_csv(DATA_FILE)
#     df['Symbol'] = df['Symbol'].astype(str).str.strip()
#     df = df[df['Symbol'].notna()]
#     df = df[df['Symbol'] != 'nan']
#     df = df[df['Symbol'] != '']
#     symbols = df['Symbol'].unique()
#     results = []
#     for symbol in symbols:
#         try:
#             symbol_df = df[df['Symbol'] == symbol].copy()
#             if len(symbol_df) < rsi_period + 1:
#                 continue
#             symbol_df['Date'] = pd.to_datetime(symbol_df['Date'], format='%d/%m/%Y', errors='coerce')
#             symbol_df = symbol_df.dropna(subset=['Date'])
#             symbol_df = symbol_df.sort_values('Date').reset_index(drop=True)
#             for col in ['Open', 'High', 'Low', 'Close']:
#                 if col in symbol_df.columns:
#                     symbol_df[col] = symbol_df[col].apply(clean_numeric_value)
#             symbol_df['RSI'] = calculate_rsi(symbol_df['Close'], period=rsi_period)
#             if symbol_df['RSI'].isna().all():
#                 continue
#             latest = symbol_df.iloc[-1]
#             latest_rsi = float(latest['RSI']) if not pd.isna(latest['RSI']) else None
#             if latest_rsi is None:
#                 continue
#             current_price = float(latest['Close'])
#             current_date = latest['Date'].strftime('%Y-%m-%d')
#         except Exception as e:
#             print(f"Error processing symbol {symbol}: {e}")
#             continue
        
#         open_cycle = get_open_cycle(user_id, symbol)
        
#         if open_cycle:
#             tsl_price = float(open_cycle['tsl_trigger_price'])
#             rsi_sell = latest_rsi < lower_threshold
#             tsl_sell = current_price < tsl_price
#             if rsi_sell or tsl_sell:
#                 signal = 'SELL'
#                 signal_class = 'sell'
#                 sell_reason = 'RSI' if rsi_sell else 'TSL'
#             else:
#                 if current_price > float(open_cycle['highest_price_after_buy']):
#                     update_tsl(open_cycle['id'], current_date, current_price)
#                     open_cycle = get_open_cycle(user_id, symbol)
#                 signal = 'HOLD'
#                 signal_class = 'neutral'
#                 sell_reason = None
#         else:
#             if latest_rsi > upper_threshold:
#                 can_buy = check_turnover_eligibility(symbol, current_date)
#                 if can_buy:
#                     signal = 'BUY'
#                     signal_class = 'buy'
#                 else:
#                     signal = 'NEUTRAL'
#                     signal_class = 'neutral'
#             else:
#                 signal = 'NEUTRAL'
#                 signal_class = 'neutral'
#             sell_reason = None
        
#         results.append({
#             'symbol': symbol,
#             'current_price': current_price,
#             'current_rsi': round(latest_rsi, 2),
#             'signal': signal,
#             'signal_class': signal_class,
#             'date': current_date,
#             'has_open_cycle': open_cycle is not None,
#             'sell_reason': sell_reason,
#             'open_cycle': {
#                 'cycle_number': open_cycle['cycle_number'],
#                 'buy_price': float(open_cycle['buy_price']),
#                 'buy_date': str(open_cycle['buy_date']),
#                 'highest_price': float(open_cycle['highest_price_after_buy']),
#                 'tsl_price': float(open_cycle['tsl_trigger_price']),
#                 'unrealized_pnl': round(((current_price - float(open_cycle['buy_price'])) / float(open_cycle['buy_price'])) * 100, 2)
#             } if open_cycle else None
#         })
#     return results

# # ============================================================================
# # API ROUTES - AUTHENTICATION
# # ============================================================================

# @app.route('/api/auth/signup', methods=['POST'])
# def signup():
#     try:
#         data = request.json
#         email = data.get('email')
#         password = data.get('password')
#         if not email or not password:
#             return jsonify({'error': 'Email and password are required'}), 400
#         if '@' not in email:
#             return jsonify({'error': 'Invalid email format'}), 400
#         if len(password) < 6:
#             return jsonify({'error': 'Password must be at least 6 characters long'}), 400
#         with get_db() as cursor:
#             cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
#             if cursor.fetchone():
#                 return jsonify({'error': 'Email already registered'}), 400
#             password_hash = hash_password(password)
#             cursor.execute('''
#                 INSERT INTO users (email, password_hash)
#                 VALUES (%s, %s)
#                 RETURNING id, email, created_at
#             ''', (email, password_hash))
#             user = cursor.fetchone()
#             token = create_token(user['id'], user['email'])
#             return jsonify({
#                 'success': True,
#                 'token': token,
#                 'user': {
#                     'id': user['id'],
#                     'email': user['email'],
#                     'created_at': user['created_at'].isoformat()
#                 }
#             })
#     except Exception as e:
#         import traceback
#         return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

# @app.route('/api/auth/login', methods=['POST'])
# def login():
#     try:
#         data = request.json
#         email = data.get('email')
#         password = data.get('password')
#         if not email or not password:
#             return jsonify({'error': 'Email and password are required'}), 400
#         with get_db() as cursor:
#             cursor.execute('''
#                 SELECT id, email, password_hash, created_at
#                 FROM users 
#                 WHERE email = %s AND is_active = TRUE
#             ''', (email,))
#             user = cursor.fetchone()
#             if not user:
#                 return jsonify({'error': 'Invalid email or password'}), 401
#             if not verify_password(password, user['password_hash']):
#                 return jsonify({'error': 'Invalid email or password'}), 401
#             cursor.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s', (user['id'],))
#             token = create_token(user['id'], user['email'])
#             return jsonify({
#                 'success': True,
#                 'token': token,
#                 'user': {
#                     'id': user['id'],
#                     'email': user['email'],
#                     'created_at': user['created_at'].isoformat()
#                 }
#             })
#     except Exception as e:
#         import traceback
#         return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

# @app.route('/api/auth/verify', methods=['GET'])
# def verify():
#     try:
#         token = request.headers.get('Authorization')
#         if not token:
#             return jsonify({'error': 'Token is missing'}), 401
#         user_id = verify_token(token)
#         if not user_id:
#             return jsonify({'error': 'Token is invalid'}), 401
#         with get_db() as cursor:
#             cursor.execute('''
#                 SELECT id, email, created_at, last_login
#                 FROM users 
#                 WHERE id = %s AND is_active = TRUE
#             ''', (user_id,))
#             user = cursor.fetchone()
#             if not user:
#                 return jsonify({'error': 'User not found'}), 404
#             return jsonify({
#                 'success': True,
#                 'user': {
#                     'id': user['id'],
#                     'email': user['email'],
#                     'created_at': user['created_at'].isoformat(),
#                     'last_login': user['last_login'].isoformat() if user['last_login'] else None
#                 }
#             })
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# # MAIN ROUTES
# @app.route('/', methods=['GET'])
# def home():
#     return jsonify({
#         'app': 'Stock Market Analyzer API v8.0',
#         'status': 'running',
#         'features': [
#             'BUY only if top 15 turnover for 2 consecutive days',
#             'SELL only if user has open cycle',
#             'Manual sell with REQUIRED custom reason (shown in red)',
#             'Automatic sell reason: AUTOMATIC',
#         ]
#     })

# @app.route('/api/scanner', methods=['GET'])
# @token_required
# def market_scanner(user_id):
#     try:
#         with get_db() as cursor:
#             cursor.execute('SELECT key, value FROM user_settings WHERE user_id = %s', (user_id,))
#             user_settings = {row['key']: int(row['value']) for row in cursor.fetchall()}
#         if not user_settings:
#             with get_db() as cursor:
#                 cursor.execute('SELECT key, value FROM global_settings')
#                 user_settings = {row['key']: int(row['value']) for row in cursor.fetchall()}
#         rsi_period = user_settings.get('default_rsi_period', 14)
#         upper_threshold = user_settings.get('default_upper_threshold', 70)
#         lower_threshold = user_settings.get('default_lower_threshold', 30)
#         results = scan_all_symbols(user_id, upper_threshold, lower_threshold, rsi_period)
#         total = len(results)
#         buy_signals = len([r for r in results if r['signal'] == 'BUY'])
#         sell_signals = len([r for r in results if r['signal'] == 'SELL'])
#         hold_signals = len([r for r in results if r['signal'] == 'HOLD'])
#         neutral_signals = len([r for r in results if r['signal'] == 'NEUTRAL'])
#         open_positions = len([r for r in results if r['has_open_cycle']])
#         return jsonify({
#             'timestamp': datetime.now().isoformat(),
#             'symbols': results,
#             'summary': {
#                 'total_symbols': total,
#                 'buy_signals': buy_signals,
#                 'sell_signals': sell_signals,
#                 'hold_signals': hold_signals,
#                 'neutral_signals': neutral_signals,
#                 'open_positions': open_positions
#             },
#             'settings': {
#                 'rsi_period': rsi_period,
#                 'upper_threshold': upper_threshold,
#                 'lower_threshold': lower_threshold
#             }
#         })
#     except Exception as e:
#         import traceback
#         return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

# @app.route('/api/symbols', methods=['GET'])
# def get_symbols():
#     try:
#         if not os.path.exists(DATA_FILE):
#             return jsonify({'error': 'Data file not found'}), 404
#         df = pd.read_csv(DATA_FILE)
#         df['Symbol'] = df['Symbol'].astype(str).str.strip()
#         df = df[df['Symbol'].notna()]
#         df = df[df['Symbol'] != 'nan']
#         df = df[df['Symbol'] != '']
#         symbols = sorted(df['Symbol'].unique().tolist())
#         return jsonify({'symbols': symbols, 'total': len(symbols)})
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

# @app.route('/api/analyze', methods=['POST', 'OPTIONS'])
# @token_required
# def analyze_data(user_id):
#     if request.method == 'OPTIONS':
#         return '', 204
#     try:
#         data = request.json
#         symbol = data.get('symbol')
#         rsi_period = data.get('rsi_period', 14)
#         upper_threshold = data.get('upper_threshold', 70)
#         lower_threshold = data.get('lower_threshold', 30)
#         if not symbol:
#             return jsonify({'error': 'Symbol is required'}), 400
#         if not os.path.exists(DATA_FILE):
#             return jsonify({'error': 'Data file not found'}), 404
#         df = pd.read_csv(DATA_FILE)
#         df = df[df['Symbol'] == symbol].copy()
#         if df.empty:
#             return jsonify({'error': f'No data found for symbol {symbol}'}), 404
#         if len(df) < rsi_period + 1:
#             return jsonify({'error': f'Not enough data for {symbol}'}), 400
#         df['Date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y', errors='coerce')
#         df = df.dropna(subset=['Date'])
#         df = df.sort_values('Date').reset_index(drop=True)
#         if df.empty:
#             return jsonify({'error': f'Invalid date data for symbol {symbol}'}), 400
#         for col in ['Open', 'High', 'Low', 'Close']:
#             df[col] = df[col].apply(clean_numeric_value)
#         df['RSI'] = calculate_rsi(df['Close'], period=rsi_period)
#         signals = []
#         for i in range(1, len(df)):
#             prev_rsi = df['RSI'].iloc[i-1]
#             curr_rsi = df['RSI'].iloc[i]
#             if pd.isna(prev_rsi) or pd.isna(curr_rsi):
#                 continue
#             if prev_rsi <= upper_threshold and curr_rsi > upper_threshold:
#                 signals.append({
#                     'date': df['Date'].iloc[i].strftime('%Y-%m-%d'),
#                     'type': 'BUY',
#                     'price': float(df['Close'].iloc[i]),
#                     'rsi': float(curr_rsi),
#                     'message': f'RSI crossed above {upper_threshold} - Strong momentum'
#                 })
#             elif prev_rsi >= lower_threshold and curr_rsi < lower_threshold:
#                 signals.append({
#                     'date': df['Date'].iloc[i].strftime('%Y-%m-%d'),
#                     'type': 'SELL',
#                     'price': float(df['Close'].iloc[i]),
#                     'rsi': float(curr_rsi),
#                     'message': f'RSI crossed below {lower_threshold} - Weak momentum'
#                 })
#         chart_data = []
#         for _, row in df.iterrows():
#             chart_data.append({
#                 'date': row['Date'].strftime('%Y-%m-%d'),
#                 'close': float(row['Close']),
#                 'rsi': float(row['RSI']) if not pd.isna(row['RSI']) else None
#             })
#         latest_rsi = float(df['RSI'].iloc[-1]) if not pd.isna(df['RSI'].iloc[-1]) else None
#         latest_signal = None
#         if latest_rsi:
#             if latest_rsi > upper_threshold:
#                 latest_signal = {
#                     'type': 'OVERBOUGHT',
#                     'message': f'RSI is {latest_rsi:.2f} - Strong momentum'
#                 }
#             elif latest_rsi < lower_threshold:
#                 latest_signal = {
#                     'type': 'OVERSOLD',
#                     'message': f'RSI is {latest_rsi:.2f} - Weak momentum'
#                 }
#             else:
#                 latest_signal = {
#                     'type': 'NEUTRAL',
#                     'message': f'RSI is {latest_rsi:.2f} - No clear signal'
#                 }
#         open_cycle = get_open_cycle(user_id, symbol)
#         return jsonify({
#             'symbol': symbol,
#             'chart_data': chart_data,
#             'signals': signals,
#             'latest_signal': latest_signal,
#             'statistics': {
#                 'total_signals': len(signals),
#                 'buy_signals': len([s for s in signals if s['type'] == 'BUY']),
#                 'sell_signals': len([s for s in signals if s['type'] == 'SELL']),
#                 'current_rsi': latest_rsi,
#                 'avg_rsi': float(df['RSI'].mean()) if not df['RSI'].isna().all() else None,
#                 'current_price': float(df['Close'].iloc[-1]),
#                 'date_range': {
#                     'start': df['Date'].min().strftime('%Y-%m-%d'),
#                     'end': df['Date'].max().strftime('%Y-%m-%d')
#                 }
#             },
#             'open_cycle': open_cycle
#         })
#     except Exception as e:
#         import traceback
#         return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

# @app.route('/api/cycles', methods=['GET'])
# @app.route('/api/cycles/<symbol>', methods=['GET'])
# @token_required
# def get_cycles(user_id, symbol=None):
#     try:
#         with get_db() as cursor:
#             if symbol:
#                 cursor.execute('''
#                     SELECT * FROM trade_cycles 
#                     WHERE user_id = %s AND symbol = %s
#                     ORDER BY cycle_number DESC
#                 ''', (user_id, symbol))
#             else:
#                 cursor.execute('''
#                     SELECT * FROM trade_cycles 
#                     WHERE user_id = %s
#                     ORDER BY symbol, cycle_number DESC
#                 ''', (user_id,))
#             cycles = []
#             for row in cursor.fetchall():
#                 cycle = dict(row)
#                 for key, value in cycle.items():
#                     if hasattr(value, '__float__'):
#                         cycle[key] = float(value)
#                     elif isinstance(value, datetime):
#                         cycle[key] = value.isoformat() if value.year > 1 else None
#                 cycles.append(cycle)
#             return jsonify({'cycles': cycles, 'total': len(cycles)})
#     except Exception as e:
#         import traceback
#         return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

# @app.route('/api/trade', methods=['POST'])
# @token_required
# def execute_trade(user_id):
#     try:
#         data = request.json
#         symbol = data.get('symbol')
#         action = data.get('action')
#         date = data.get('date')
#         price = data.get('price')
#         rsi = data.get('rsi')
#         if not all([symbol, action, date, price, rsi]):
#             return jsonify({'error': 'Missing required fields'}), 400
#         if action == 'BUY':
#             open_cycle = get_open_cycle(user_id, symbol)
#             if open_cycle:
#                 return jsonify({'error': f'Cycle {open_cycle["cycle_number"]} is still open'}), 400
#             if not check_turnover_eligibility(symbol, date):
#                 return jsonify({'error': f'{symbol} is not in top 15 turnover for 2 consecutive days'}), 400
#             cycle_number = create_buy_cycle(user_id, symbol, date, price, rsi)
#             return jsonify({
#                 'success': True,
#                 'action': 'BUY',
#                 'cycle_number': cycle_number,
#                 'message': f'Opened Cycle {cycle_number} for {symbol}'
#             })
#         elif action == 'SELL':
#             open_cycle = get_open_cycle(user_id, symbol)
#             if not open_cycle:
#                 return jsonify({'error': 'No open cycle to close'}), 400
#             sell_reason = 'AUTOMATIC'
#             profit_loss, profit_loss_percent = close_cycle(
#                 open_cycle['id'], date, price, rsi, sell_reason
#             )
#             return jsonify({
#                 'success': True,
#                 'action': 'SELL',
#                 'cycle_number': open_cycle['cycle_number'],
#                 'sell_reason': sell_reason,
#                 'profit_loss': round(profit_loss, 2),
#                 'profit_loss_percent': round(profit_loss_percent, 2),
#                 'message': f'Closed Cycle {open_cycle["cycle_number"]} - Automatic sell'
#             })
#         else:
#             return jsonify({'error': 'Invalid action'}), 400
#     except Exception as e:
#         import traceback
#         return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

# @app.route('/api/trade/manual-sell', methods=['POST'])
# @token_required
# def manual_sell(user_id):
#     try:
#         data = request.json
#         symbol = data.get('symbol')
#         date = data.get('date')
#         price = data.get('price')
#         rsi = data.get('rsi')
#         reason = data.get('reason', '').strip()
#         if not reason:
#             return jsonify({'error': 'Sell reason is REQUIRED for manual sell'}), 400
#         if not all([symbol, date, price, rsi]):
#             return jsonify({'error': 'Missing required fields'}), 400
#         open_cycle = get_open_cycle(user_id, symbol)
#         if not open_cycle:
#             return jsonify({'error': 'No open cycle to close'}), 400
#         profit_loss, profit_loss_percent = close_cycle(
#             open_cycle['id'], date, price, rsi, reason
#         )
#         return jsonify({
#             'success': True,
#             'action': 'MANUAL_SELL',
#             'cycle_number': open_cycle['cycle_number'],
#             'reason': reason,
#             'profit_loss': round(profit_loss, 2),
#             'profit_loss_percent': round(profit_loss_percent, 2),
#             'message': f'Manually closed Cycle {open_cycle["cycle_number"]} for {symbol}'
#         })
#     except Exception as e:
#         import traceback
#         return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

# # ============================================================================
# # MAIN
# # ============================================================================

# if __name__ == '__main__':
#     print("\n" + "="*80)
#     print("🚀 Stock Market Analyzer API - v8.0 (Complete)")
#     print("="*80)
#     print("\n✨ Features:")
#     print("   - BUY only if top 15 turnover for 2 consecutive days")
#     print("   - SELL only shown if user has open cycle")
#     print("   - Manual sell requires custom reason (shown in red)")
#     print("   - Automatic sell reason: AUTOMATIC (not TSL or RSI)")
#     print("\n🌐 Server: http://localhost:8080")
#     print("="*80 + "\n")
#     if not init_connection_pool():
#         print("❌ Failed to connect to database!")
#         exit(1)
#     app.run(host='0.0.0.0', port=8080, debug=True, use_reloader=False, threaded=True)

"""
Flask server for Stock Market RSI Analysis - v9.0 (WITH ADMIN PANEL)
Complete implementation with admin functionality
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from dotenv import load_dotenv
import bcrypt
import jwt
from functools import wraps

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['DEBUG'] = True
app.config['ENV'] = 'development'

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'data_sample.csv')
JWT_SECRET = os.getenv('JWT_SECRET_KEY', 'your-super-secret-key-change-this-in-production')

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'trading_db'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'your_password_here')
}

connection_pool = None

def init_connection_pool():
    global connection_pool
    try:
        connection_pool = psycopg2.pool.SimpleConnectionPool(1, 20, **DB_CONFIG)
        if connection_pool:
            print("✅ PostgreSQL connection pool created successfully")
            return True
    except Exception as e:
        print(f"❌ Error creating connection pool: {e}")
        return False

@contextmanager
def get_db():
    conn = None
    try:
        conn = connection_pool.getconn()
        conn.autocommit = False
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        yield cursor
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            cursor.close()
            connection_pool.putconn(conn)

# ============================================================================
# AUTHENTICATION HELPERS
# ============================================================================

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, password_hash):
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def create_token(user_id, email, is_admin=False):
    payload = {
        'user_id': user_id,
        'email': email,
        'is_admin': is_admin,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 204
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Token is missing'}), 401
        token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Token is invalid'}), 401
        return f(payload['user_id'], *args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator for admin-only routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 204
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Token is missing'}), 401
        token = auth_header.split(" ")[1] if " " in auth_header else auth_header
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Token is invalid'}), 401
        if not payload.get('is_admin', False):
            return jsonify({'error': 'Admin access required'}), 403
        return f(payload['user_id'], *args, **kwargs)
    return decorated

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def clean_numeric_value(value):
    if isinstance(value, str):
        return float(value.replace(',', ''))
    return float(value)

def calculate_rsi(prices, period=14):
    if len(prices) < period + 1:
        return pd.Series([np.nan] * len(prices), index=prices.index)
    delta = prices.diff()
    gains = delta.where(delta > 0, 0)
    losses = -delta.where(delta < 0, 0)
    avg_gain = gains.rolling(window=period, min_periods=period).mean()
    avg_loss = losses.rolling(window=period, min_periods=period).mean()
    avg_gain = avg_gain.copy()
    avg_loss = avg_loss.copy()
    if len(gains) > period:
        for i in range(period, len(gains)):
            if pd.notna(avg_gain.iloc[i-1]) and pd.notna(avg_loss.iloc[i-1]):
                avg_gain.iloc[i] = (avg_gain.iloc[i-1] * (period - 1) + gains.iloc[i]) / period
                avg_loss.iloc[i] = (avg_loss.iloc[i-1] * (period - 1) + losses.iloc[i]) / period
    rs = avg_gain / avg_loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return rsi

def get_top_turnover_symbols(df, date, top_n=15):
    date_data = df[df['Date'] == date].copy()
    if 'Turnover' in date_data.columns:
        date_data['calculated_turnover'] = date_data['Turnover'].apply(clean_numeric_value)
    else:
        date_data['calculated_turnover'] = (
            date_data['Volume'].apply(clean_numeric_value) * 
            date_data['Close'].apply(clean_numeric_value)
        )
    top_symbols = date_data.nlargest(top_n, 'calculated_turnover')['Symbol'].tolist()
    return set(top_symbols)

def check_turnover_eligibility(symbol, date_str):
    try:
        df = pd.read_csv(DATA_FILE)
        df['Symbol'] = df['Symbol'].astype(str).str.strip()
        df = df[df['Symbol'].notna() & (df['Symbol'] != 'nan') & (df['Symbol'] != '')]
        df['Date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y', errors='coerce')
        df = df.dropna(subset=['Date'])
        df = df.sort_values('Date')
        current_date = pd.to_datetime(date_str, format='%Y-%m-%d')
        unique_dates = sorted(df['Date'].unique())
        current_date_idx = None
        for idx, d in enumerate(unique_dates):
            if d == current_date:
                current_date_idx = idx
                break
        if current_date_idx is None or current_date_idx < 2:
            return False
        day_1 = unique_dates[current_date_idx - 1]
        day_2 = unique_dates[current_date_idx - 2]
        top_day_1 = get_top_turnover_symbols(df, day_1, 15)
        top_day_2 = get_top_turnover_symbols(df, day_2, 15)
        return symbol in top_day_1 and symbol in top_day_2
    except Exception as e:
        print(f"Error checking turnover eligibility for {symbol}: {e}")
        return False

# ============================================================================
# DATABASE FUNCTIONS
# ============================================================================

def get_next_cycle_number(user_id, symbol):
    with get_db() as cursor:
        cursor.execute('''
            SELECT MAX(cycle_number) as max_cycle 
            FROM trade_cycles 
            WHERE user_id = %s AND symbol = %s
        ''', (user_id, symbol))
        result = cursor.fetchone()
        return (result['max_cycle'] or 0) + 1

def get_open_cycle(user_id, symbol):
    with get_db() as cursor:
        cursor.execute('''
            SELECT * FROM trade_cycles 
            WHERE user_id = %s AND symbol = %s AND status = 'OPEN'
            ORDER BY cycle_number DESC
            LIMIT 1
        ''', (user_id, symbol))
        result = cursor.fetchone()
        return dict(result) if result else None

def create_buy_cycle(user_id, symbol, date, price, rsi):
    cycle_number = get_next_cycle_number(user_id, symbol)
    with get_db() as cursor:
        cursor.execute('''
            INSERT INTO trade_cycles (
                user_id, symbol, cycle_number, status, buy_date, buy_price, buy_rsi,
                highest_price_after_buy, tsl_trigger_price
            ) VALUES (%s, %s, %s, 'OPEN', %s, %s, %s, %s, %s)
            RETURNING id
        ''', (user_id, symbol, cycle_number, date, price, rsi, price, price * 0.95))
        cycle_id = cursor.fetchone()['id']
        cursor.execute('''
            INSERT INTO price_tracking (cycle_id, date, close_price, tsl_price, is_new_high)
            VALUES (%s, %s, %s, %s, %s)
        ''', (cycle_id, date, price, price * 0.95, True))
        return cycle_number

def update_tsl(cycle_id, date, current_price):
    with get_db() as cursor:
        cursor.execute('''
            SELECT highest_price_after_buy, tsl_trigger_price 
            FROM trade_cycles 
            WHERE id = %s
        ''', (cycle_id,))
        result = cursor.fetchone()
        highest_price = float(result['highest_price_after_buy'])
        current_tsl = float(result['tsl_trigger_price'])
        is_new_high = False
        if current_price > highest_price:
            highest_price = current_price
            current_tsl = current_price * 0.95
            is_new_high = True
            cursor.execute('''
                UPDATE trade_cycles 
                SET highest_price_after_buy = %s, 
                    tsl_trigger_price = %s,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            ''', (highest_price, current_tsl, cycle_id))
        cursor.execute('''
            INSERT INTO price_tracking (cycle_id, date, close_price, tsl_price, is_new_high)
            VALUES (%s, %s, %s, %s, %s)
        ''', (cycle_id, date, current_price, current_tsl, is_new_high))
        return current_tsl, is_new_high

def close_cycle(cycle_id, date, price, rsi, reason='AUTOMATIC'):
    with get_db() as cursor:
        cursor.execute('SELECT buy_price FROM trade_cycles WHERE id = %s', (cycle_id,))
        result = cursor.fetchone()
        buy_price = float(result['buy_price'])
        profit_loss = price - buy_price
        profit_loss_percent = ((price - buy_price) / buy_price) * 100
        cursor.execute('''
            UPDATE trade_cycles 
            SET status = 'CLOSED',
                sell_date = %s,
                sell_price = %s,
                sell_rsi = %s,
                profit_loss = %s,
                profit_loss_percent = %s,
                sell_reason = %s,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (date, price, rsi, profit_loss, profit_loss_percent, reason, cycle_id))
        return profit_loss, profit_loss_percent

def get_settings(user_id=None):
    """Get settings - user-specific or global defaults"""
    with get_db() as cursor:
        if user_id:
            cursor.execute('SELECT key, value FROM user_settings WHERE user_id = %s', (user_id,))
            user_settings = {row['key']: int(row['value']) for row in cursor.fetchall()}
            if user_settings:
                return user_settings
        
        cursor.execute('SELECT key, value FROM global_settings')
        global_settings = {row['key']: int(row['value']) for row in cursor.fetchall()}
        return global_settings

def scan_all_symbols(user_id, upper_threshold=None, lower_threshold=None, rsi_period=None):
    """Scan all symbols - uses passed thresholds or gets from database"""
    if not os.path.exists(DATA_FILE):
        return []
    
    # Get settings from database if not provided
    if upper_threshold is None or lower_threshold is None or rsi_period is None:
        settings = get_settings(user_id)
        upper_threshold = upper_threshold or settings.get('default_upper_threshold', 70)
        lower_threshold = lower_threshold or settings.get('default_lower_threshold', 30)
        rsi_period = rsi_period or settings.get('default_rsi_period', 14)
    
    df = pd.read_csv(DATA_FILE)
    df['Symbol'] = df['Symbol'].astype(str).str.strip()
    df = df[df['Symbol'].notna()]
    df = df[df['Symbol'] != 'nan']
    df = df[df['Symbol'] != '']
    symbols = df['Symbol'].unique()
    results = []
    
    for symbol in symbols:
        try:
            symbol_df = df[df['Symbol'] == symbol].copy()
            if len(symbol_df) < rsi_period + 1:
                continue
            symbol_df['Date'] = pd.to_datetime(symbol_df['Date'], format='%d/%m/%Y', errors='coerce')
            symbol_df = symbol_df.dropna(subset=['Date'])
            symbol_df = symbol_df.sort_values('Date').reset_index(drop=True)
            for col in ['Open', 'High', 'Low', 'Close']:
                if col in symbol_df.columns:
                    symbol_df[col] = symbol_df[col].apply(clean_numeric_value)
            symbol_df['RSI'] = calculate_rsi(symbol_df['Close'], period=rsi_period)
            if symbol_df['RSI'].isna().all():
                continue
            latest = symbol_df.iloc[-1]
            latest_rsi = float(latest['RSI']) if not pd.isna(latest['RSI']) else None
            if latest_rsi is None:
                continue
            current_price = float(latest['Close'])
            current_date = latest['Date'].strftime('%Y-%m-%d')
        except Exception as e:
            print(f"Error processing symbol {symbol}: {e}")
            continue
        
        open_cycle = get_open_cycle(user_id, symbol)
        
        if open_cycle:
            tsl_price = float(open_cycle['tsl_trigger_price'])
            rsi_sell = latest_rsi < lower_threshold
            tsl_sell = current_price < tsl_price
            if rsi_sell or tsl_sell:
                signal = 'SELL'
                signal_class = 'sell'
                sell_reason = 'RSI' if rsi_sell else 'TSL'
            else:
                if current_price > float(open_cycle['highest_price_after_buy']):
                    update_tsl(open_cycle['id'], current_date, current_price)
                    open_cycle = get_open_cycle(user_id, symbol)
                signal = 'HOLD'
                signal_class = 'neutral'
                sell_reason = None
        else:
            if latest_rsi > upper_threshold:
                can_buy = check_turnover_eligibility(symbol, current_date)
                if can_buy:
                    signal = 'BUY'
                    signal_class = 'buy'
                else:
                    signal = 'NEUTRAL'
                    signal_class = 'neutral'
            else:
                signal = 'NEUTRAL'
                signal_class = 'neutral'
            sell_reason = None
        
        results.append({
            'symbol': symbol,
            'current_price': current_price,
            'current_rsi': round(latest_rsi, 2),
            'signal': signal,
            'signal_class': signal_class,
            'date': current_date,
            'has_open_cycle': open_cycle is not None,
            'sell_reason': sell_reason,
            'open_cycle': {
                'cycle_number': open_cycle['cycle_number'],
                'buy_price': float(open_cycle['buy_price']),
                'buy_date': str(open_cycle['buy_date']),
                'highest_price': float(open_cycle['highest_price_after_buy']),
                'tsl_price': float(open_cycle['tsl_trigger_price']),
                'unrealized_pnl': round(((current_price - float(open_cycle['buy_price'])) / float(open_cycle['buy_price'])) * 100, 2)
            } if open_cycle else None
        })
    
    return results

# ============================================================================
# AUTH ROUTES
# ============================================================================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        if '@' not in email:
            return jsonify({'error': 'Invalid email format'}), 400
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        with get_db() as cursor:
            cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
            if cursor.fetchone():
                return jsonify({'error': 'Email already registered'}), 400
            
            password_hash = hash_password(password)
            cursor.execute('''
                INSERT INTO users (email, password_hash, is_admin)
                VALUES (%s, %s, %s)
                RETURNING id, email, is_admin, created_at
            ''', (email, password_hash, False))
            
            user = cursor.fetchone()
            token = create_token(user['id'], user['email'], user['is_admin'])
            
            return jsonify({
                'success': True,
                'token': token,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'is_admin': user['is_admin'],
                    'created_at': user['created_at'].isoformat()
                }
            })
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        with get_db() as cursor:
            cursor.execute('''
                SELECT id, email, password_hash, is_admin, created_at
                FROM users 
                WHERE email = %s AND is_active = TRUE
            ''', (email,))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({'error': 'Invalid email or password'}), 401
            if not verify_password(password, user['password_hash']):
                return jsonify({'error': 'Invalid email or password'}), 401
            
            cursor.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s', (user['id'],))
            token = create_token(user['id'], user['email'], user['is_admin'])
            
            return jsonify({
                'success': True,
                'token': token,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'is_admin': user['is_admin'],
                    'created_at': user['created_at'].isoformat()
                }
            })
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/auth/verify', methods=['GET'])
def verify():
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Token is invalid'}), 401
        
        with get_db() as cursor:
            cursor.execute('''
                SELECT id, email, is_admin, created_at, last_login
                FROM users 
                WHERE id = %s AND is_active = TRUE
            ''', (payload['user_id'],))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'email': user['email'],
                    'is_admin': user['is_admin'],
                    'created_at': user['created_at'].isoformat(),
                    'last_login': user['last_login'].isoformat() if user['last_login'] else None
                }
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============================================================================
# ADMIN ROUTES
# ============================================================================

@app.route('/api/admin/settings', methods=['GET'])
@admin_required
def get_admin_settings(admin_id):
    """Get global settings"""
    try:
        with get_db() as cursor:
            cursor.execute('SELECT * FROM global_settings ORDER BY key')
            settings = {}
            for row in cursor.fetchall():
                settings[row['key']] = {
                    'id': row['id'],
                    'key': row['key'],
                    'value': int(row['value']),
                    'description': row['description'],
                    'updated_at': row['updated_at'].isoformat() if row['updated_at'] else None
                }
            return jsonify({'settings': settings})
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/admin/settings', methods=['PUT'])
@admin_required
def update_admin_settings(admin_id):
    """Update global settings"""
    try:
        data = request.json
        key = data.get('key')
        value = data.get('value')
        
        if not key or value is None:
            return jsonify({'error': 'Key and value are required'}), 400
        
        with get_db() as cursor:
            cursor.execute('''
                UPDATE global_settings 
                SET value = %s, updated_at = CURRENT_TIMESTAMP
                WHERE key = %s
                RETURNING *
            ''', (str(value), key))
            
            updated = cursor.fetchone()
            if not updated:
                return jsonify({'error': 'Setting not found'}), 404
            
            return jsonify({
                'success': True,
                'message': f'Updated {key} to {value}',
                'setting': {
                    'key': updated['key'],
                    'value': int(updated['value']),
                    'description': updated['description']
                }
            })
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users(admin_id):
    """Get all users"""
    try:
        with get_db() as cursor:
            cursor.execute('''
                SELECT id, email, is_admin, is_active, created_at, last_login
                FROM users
                ORDER BY created_at DESC
            ''')
            users = []
            for row in cursor.fetchall():
                users.append({
                    'id': row['id'],
                    'email': row['email'],
                    'is_admin': row['is_admin'],
                    'is_active': row['is_active'],
                    'created_at': row['created_at'].isoformat(),
                    'last_login': row['last_login'].isoformat() if row['last_login'] else None
                })
            return jsonify({'users': users, 'total': len(users)})
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/admin/users/<int:user_id>/toggle-admin', methods=['POST'])
@admin_required
def toggle_user_admin(admin_id, user_id):
    """Toggle user admin status"""
    try:
        with get_db() as cursor:
            cursor.execute('''
                UPDATE users 
                SET is_admin = NOT is_admin
                WHERE id = %s
                RETURNING id, email, is_admin
            ''', (user_id,))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            return jsonify({
                'success': True,
                'message': f'User {user["email"]} is now {"an admin" if user["is_admin"] else "not an admin"}',
                'user': dict(user)
            })
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/admin/users/<int:user_id>/toggle-active', methods=['POST'])
@admin_required
def toggle_user_active(admin_id, user_id):
    """Toggle user active status"""
    try:
        with get_db() as cursor:
            cursor.execute('''
                UPDATE users 
                SET is_active = NOT is_active
                WHERE id = %s
                RETURNING id, email, is_active
            ''', (user_id,))
            user = cursor.fetchone()
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            return jsonify({
                'success': True,
                'message': f'User {user["email"]} is now {"active" if user["is_active"] else "inactive"}',
                'user': dict(user)
            })
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats(admin_id):
    """Get admin dashboard statistics"""
    try:
        with get_db() as cursor:
            # Total users
            cursor.execute('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE')
            total_users = cursor.fetchone()['count']
            
            # Total cycles
            cursor.execute('SELECT COUNT(*) as count FROM trade_cycles')
            total_cycles = cursor.fetchone()['count']
            
            # Open cycles
            cursor.execute("SELECT COUNT(*) as count FROM trade_cycles WHERE status = 'OPEN'")
            open_cycles = cursor.fetchone()['count']
            
            # Total profit/loss
            cursor.execute('SELECT SUM(profit_loss) as total FROM trade_cycles WHERE status = \'CLOSED\'')
            total_pnl = cursor.fetchone()['total'] or 0
            
            return jsonify({
                'stats': {
                    'total_users': total_users,
                    'total_cycles': total_cycles,
                    'open_cycles': open_cycles,
                    'total_pnl': float(total_pnl)
                }
            })
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

# ============================================================================
# REGULAR USER ROUTES
# ============================================================================

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'app': 'Stock Market Analyzer API v9.0',
        'status': 'running',
        'features': [
            'Admin Panel',
            'Global Settings Management',
            'User Management',
            'Threshold Control from Database'
        ]
    })

@app.route('/api/settings', methods=['GET'])
@token_required
def get_user_settings(user_id):
    """Get settings for current user"""
    try:
        settings = get_settings(user_id)
        return jsonify({'settings': settings})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/scanner', methods=['GET'])
@token_required
def market_scanner(user_id):
    try:
        settings = get_settings(user_id)
        rsi_period = settings.get('default_rsi_period', 14)
        upper_threshold = settings.get('default_upper_threshold', 70)
        lower_threshold = settings.get('default_lower_threshold', 30)
        
        results = scan_all_symbols(user_id, upper_threshold, lower_threshold, rsi_period)
        
        total = len(results)
        buy_signals = len([r for r in results if r['signal'] == 'BUY'])
        sell_signals = len([r for r in results if r['signal'] == 'SELL'])
        hold_signals = len([r for r in results if r['signal'] == 'HOLD'])
        neutral_signals = len([r for r in results if r['signal'] == 'NEUTRAL'])
        open_positions = len([r for r in results if r['has_open_cycle']])
        
        return jsonify({
            'timestamp': datetime.now().isoformat(),
            'symbols': results,
            'summary': {
                'total_symbols': total,
                'buy_signals': buy_signals,
                'sell_signals': sell_signals,
                'hold_signals': hold_signals,
                'neutral_signals': neutral_signals,
                'open_positions': open_positions
            },
            'settings': {
                'rsi_period': rsi_period,
                'upper_threshold': upper_threshold,
                'lower_threshold': lower_threshold
            }
        })
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/symbols', methods=['GET'])
def get_symbols():
    try:
        if not os.path.exists(DATA_FILE):
            return jsonify({'error': 'Data file not found'}), 404
        df = pd.read_csv(DATA_FILE)
        df['Symbol'] = df['Symbol'].astype(str).str.strip()
        df = df[df['Symbol'].notna()]
        df = df[df['Symbol'] != 'nan']
        df = df[df['Symbol'] != '']
        symbols = sorted(df['Symbol'].unique().tolist())
        return jsonify({'symbols': symbols, 'total': len(symbols)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
@token_required
def analyze_data(user_id):
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.json
        symbol = data.get('symbol')
        
        # Get thresholds from database settings
        settings = get_settings(user_id)
        rsi_period = data.get('rsi_period') or settings.get('default_rsi_period', 14)
        upper_threshold = data.get('upper_threshold') or settings.get('default_upper_threshold', 70)
        lower_threshold = data.get('lower_threshold') or settings.get('default_lower_threshold', 30)
        
        if not symbol:
            return jsonify({'error': 'Symbol is required'}), 400
        if not os.path.exists(DATA_FILE):
            return jsonify({'error': 'Data file not found'}), 404
        
        df = pd.read_csv(DATA_FILE)
        df = df[df['Symbol'] == symbol].copy()
        if df.empty:
            return jsonify({'error': f'No data found for symbol {symbol}'}), 404
        if len(df) < rsi_period + 1:
            return jsonify({'error': f'Not enough data for {symbol}'}), 400
        
        df['Date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y', errors='coerce')
        df = df.dropna(subset=['Date'])
        df = df.sort_values('Date').reset_index(drop=True)
        if df.empty:
            return jsonify({'error': f'Invalid date data for symbol {symbol}'}), 400
        
        for col in ['Open', 'High', 'Low', 'Close']:
            df[col] = df[col].apply(clean_numeric_value)
        df['RSI'] = calculate_rsi(df['Close'], period=rsi_period)
        
        signals = []
        for i in range(1, len(df)):
            prev_rsi = df['RSI'].iloc[i-1]
            curr_rsi = df['RSI'].iloc[i]
            if pd.isna(prev_rsi) or pd.isna(curr_rsi):
                continue
            if prev_rsi <= upper_threshold and curr_rsi > upper_threshold:
                signals.append({
                    'date': df['Date'].iloc[i].strftime('%Y-%m-%d'),
                    'type': 'BUY',
                    'price': float(df['Close'].iloc[i]),
                    'rsi': float(curr_rsi),
                    'message': f'RSI crossed above {upper_threshold}'
                })
            elif prev_rsi >= lower_threshold and curr_rsi < lower_threshold:
                signals.append({
                    'date': df['Date'].iloc[i].strftime('%Y-%m-%d'),
                    'type': 'SELL',
                    'price': float(df['Close'].iloc[i]),
                    'rsi': float(curr_rsi),
                    'message': f'RSI crossed below {lower_threshold}'
                })
        
        chart_data = []
        for _, row in df.iterrows():
            chart_data.append({
                'date': row['Date'].strftime('%Y-%m-%d'),
                'close': float(row['Close']),
                'rsi': float(row['RSI']) if not pd.isna(row['RSI']) else None
            })
        
        latest_rsi = float(df['RSI'].iloc[-1]) if not pd.isna(df['RSI'].iloc[-1]) else None
        latest_signal = None
        if latest_rsi:
            if latest_rsi > upper_threshold:
                latest_signal = {'type': 'OVERBOUGHT', 'message': f'RSI is {latest_rsi:.2f}'}
            elif latest_rsi < lower_threshold:
                latest_signal = {'type': 'OVERSOLD', 'message': f'RSI is {latest_rsi:.2f}'}
            else:
                latest_signal = {'type': 'NEUTRAL', 'message': f'RSI is {latest_rsi:.2f}'}
        
        open_cycle = get_open_cycle(user_id, symbol)
        
        return jsonify({
            'symbol': symbol,
            'chart_data': chart_data,
            'signals': signals,
            'latest_signal': latest_signal,
            'statistics': {
                'total_signals': len(signals),
                'buy_signals': len([s for s in signals if s['type'] == 'BUY']),
                'sell_signals': len([s for s in signals if s['type'] == 'SELL']),
                'current_rsi': latest_rsi,
                'avg_rsi': float(df['RSI'].mean()) if not df['RSI'].isna().all() else None,
                'current_price': float(df['Close'].iloc[-1]),
                'date_range': {
                    'start': df['Date'].min().strftime('%Y-%m-%d'),
                    'end': df['Date'].max().strftime('%Y-%m-%d')
                }
            },
            'open_cycle': open_cycle,
            'current_settings': {
                'rsi_period': rsi_period,
                'upper_threshold': upper_threshold,
                'lower_threshold': lower_threshold
            }
        })
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/cycles', methods=['GET'])
@app.route('/api/cycles/<symbol>', methods=['GET'])
@token_required
def get_cycles(user_id, symbol=None):
    try:
        with get_db() as cursor:
            if symbol:
                cursor.execute('''
                    SELECT * FROM trade_cycles 
                    WHERE user_id = %s AND symbol = %s
                    ORDER BY cycle_number DESC
                ''', (user_id, symbol))
            else:
                cursor.execute('''
                    SELECT * FROM trade_cycles 
                    WHERE user_id = %s
                    ORDER BY symbol, cycle_number DESC
                ''', (user_id,))
            cycles = []
            for row in cursor.fetchall():
                cycle = dict(row)
                for key, value in cycle.items():
                    if hasattr(value, '__float__'):
                        cycle[key] = float(value)
                    elif isinstance(value, datetime):
                        cycle[key] = value.isoformat() if value.year > 1 else None
                cycles.append(cycle)
            return jsonify({'cycles': cycles, 'total': len(cycles)})
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/trade', methods=['POST'])
@token_required
def execute_trade(user_id):
    try:
        data = request.json
        symbol = data.get('symbol')
        action = data.get('action')
        date = data.get('date')
        price = data.get('price')
        rsi = data.get('rsi')
        
        if not all([symbol, action, date, price, rsi]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if action == 'BUY':
            open_cycle = get_open_cycle(user_id, symbol)
            if open_cycle:
                return jsonify({'error': f'Cycle {open_cycle["cycle_number"]} is still open'}), 400
            if not check_turnover_eligibility(symbol, date):
                return jsonify({'error': f'{symbol} is not in top 15 turnover for 2 consecutive days'}), 400
            cycle_number = create_buy_cycle(user_id, symbol, date, price, rsi)
            return jsonify({
                'success': True,
                'action': 'BUY',
                'cycle_number': cycle_number,
                'message': f'Opened Cycle {cycle_number} for {symbol}'
            })
        elif action == 'SELL':
            open_cycle = get_open_cycle(user_id, symbol)
            if not open_cycle:
                return jsonify({'error': 'No open cycle to close'}), 400
            sell_reason = 'AUTOMATIC'
            profit_loss, profit_loss_percent = close_cycle(
                open_cycle['id'], date, price, rsi, sell_reason
            )
            return jsonify({
                'success': True,
                'action': 'SELL',
                'cycle_number': open_cycle['cycle_number'],
                'sell_reason': sell_reason,
                'profit_loss': round(profit_loss, 2),
                'profit_loss_percent': round(profit_loss_percent, 2),
                'message': f'Closed Cycle {open_cycle["cycle_number"]} - Automatic sell'
            })
        else:
            return jsonify({'error': 'Invalid action'}), 400
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/trade/manual-sell', methods=['POST'])
@token_required
def manual_sell(user_id):
    try:
        data = request.json
        symbol = data.get('symbol')
        date = data.get('date')
        price = data.get('price')
        rsi = data.get('rsi')
        reason = data.get('reason', '').strip()
        
        if not reason:
            return jsonify({'error': 'Sell reason is REQUIRED for manual sell'}), 400
        if not all([symbol, date, price, rsi]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        open_cycle = get_open_cycle(user_id, symbol)
        if not open_cycle:
            return jsonify({'error': 'No open cycle to close'}), 400
        
        profit_loss, profit_loss_percent = close_cycle(
            open_cycle['id'], date, price, rsi, reason
        )
        
        return jsonify({
            'success': True,
            'action': 'MANUAL_SELL',
            'cycle_number': open_cycle['cycle_number'],
            'reason': reason,
            'profit_loss': round(profit_loss, 2),
            'profit_loss_percent': round(profit_loss_percent, 2),
            'message': f'Manually closed Cycle {open_cycle["cycle_number"]} for {symbol}'
        })
    except Exception as e:
        import traceback
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

if __name__ == '__main__':
    print("\n" + "="*80)
    print("🚀 Stock Market Analyzer API - v9.0 (WITH ADMIN)")
    print("="*80)
    print("\n✨ Features:")
    print("   - Admin Panel")
    print("   - Global Settings Management")
    print("   - Database-Driven Thresholds")
    print("   - User Management")
    print("\n🌐 Server: http://localhost:8080")
    print("="*80 + "\n")
    
    if not init_connection_pool():
        print("❌ Failed to connect to database!")
        exit(1)
    
    app.run(host='0.0.0.0', port=8080, debug=True, use_reloader=False, threaded=True)