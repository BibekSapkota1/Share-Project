"""
Flask server for Stock Market RSI Analysis
CUSTOM VERSION with reversed RSI interpretation
BUY when RSI > upper threshold
SELL when RSI < lower threshold
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# Very permissive CORS - allows all origins
CORS(app, resources={r"/*": {"origins": "*"}})

# Disable Flask security warnings for development
app.config['DEBUG'] = True
app.config['ENV'] = 'development'

# Path to data file
DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'data_sample.csv')

def clean_numeric_value(value):
    """Clean numeric values that may have commas"""
    if isinstance(value, str):
        return float(value.replace(',', ''))
    return float(value)

def calculate_rsi(prices, period=14):
    """
    Calculate RSI using the standard Wilder's smoothing method
    This is the industry-standard RSI calculation
    
    Formula:
    RSI = 100 - (100 / (1 + RS))
    where RS = Average Gain / Average Loss
    
    Uses Wilder's smoothing for averaging (EMA-like approach)
    """
    # Calculate price changes
    delta = prices.diff()
    
    # Separate gains and losses
    gains = delta.where(delta > 0, 0)
    losses = -delta.where(delta < 0, 0)
    
    # First RSI calculation uses simple average
    avg_gain = gains.rolling(window=period, min_periods=period).mean()
    avg_loss = losses.rolling(window=period, min_periods=period).mean()
    
    # Subsequent values use Wilder's smoothing
    # This is more accurate than simple rolling average
    for i in range(period, len(gains)):
        avg_gain.iloc[i] = (avg_gain.iloc[i-1] * (period - 1) + gains.iloc[i]) / period
        avg_loss.iloc[i] = (avg_loss.iloc[i-1] * (period - 1) + losses.iloc[i]) / period
    
    # Calculate RS and RSI
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    
    return rsi

def generate_signals(df, rsi_period=14, upper_threshold=70, lower_threshold=30):
    """
    Generate buy/sell signals based on CUSTOM RSI interpretation
    
    CUSTOM LOGIC (REVERSED):
    - BUY signal: When RSI crosses ABOVE upper threshold (high momentum = buy)
    - SELL signal: When RSI crosses BELOW lower threshold (low momentum = sell)
    
    This is the opposite of traditional interpretation
    """
    df['RSI'] = calculate_rsi(df['Close'], period=rsi_period)
    
    signals = []
    for i in range(1, len(df)):
        prev_rsi = df['RSI'].iloc[i-1]
        curr_rsi = df['RSI'].iloc[i]
        
        # Skip if RSI values are NaN
        if pd.isna(prev_rsi) or pd.isna(curr_rsi):
            continue
        
        # BUY signal: RSI crosses ABOVE upper threshold (CUSTOM LOGIC)
        # User's interpretation: High RSI means strong momentum = time to buy
        if prev_rsi <= upper_threshold and curr_rsi > upper_threshold:
            signals.append({
                'date': df['Date'].iloc[i],
                'type': 'BUY',
                'price': float(df['Close'].iloc[i]),
                'rsi': float(curr_rsi),
                'message': f'RSI crossed above {upper_threshold} - Strong momentum, buy signal'
            })
        
        # SELL signal: RSI crosses BELOW lower threshold (CUSTOM LOGIC)
        # User's interpretation: Low RSI means weak momentum = time to sell
        elif prev_rsi >= lower_threshold and curr_rsi < lower_threshold:
            signals.append({
                'date': df['Date'].iloc[i],
                'type': 'SELL',
                'price': float(df['Close'].iloc[i]),
                'rsi': float(curr_rsi),
                'message': f'RSI crossed below {lower_threshold} - Weak momentum, sell signal'
            })
    
    return signals

@app.route('/', methods=['GET'])
def home():
    """Root endpoint"""
    return jsonify({
        'app': 'Stock Market Analyzer API (CUSTOM LOGIC)',
        'status': 'running',
        'version': '3.0',
        'custom_logic': {
            'description': 'Reversed RSI interpretation',
            'buy_rule': 'BUY when RSI crosses ABOVE upper threshold',
            'sell_rule': 'SELL when RSI crosses BELOW lower threshold'
        },
        'endpoints': {
            'health': '/api/health',
            'symbols': '/api/symbols',
            'analyze': '/api/analyze (POST)'
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat(),
        'data_file_exists': os.path.exists(DATA_FILE)
    })

@app.route('/api/symbols', methods=['GET'])
def get_symbols():
    """Get list of available symbols"""
    try:
        if not os.path.exists(DATA_FILE):
            return jsonify({'error': f'Data file not found at {DATA_FILE}'}), 404
        
        df = pd.read_csv(DATA_FILE)
        symbols = sorted(df['Symbol'].unique().tolist())
        
        return jsonify({
            'symbols': symbols,
            'total': len(symbols),
            'data_file': DATA_FILE
        })
    
    except Exception as e:
        return jsonify({'error': str(e), 'file': DATA_FILE}), 500

@app.route('/api/analyze', methods=['POST', 'OPTIONS'])
def analyze_data():
    """Analyze stock data with CUSTOM RSI interpretation"""
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.json
        symbol = data.get('symbol')
        rsi_period = data.get('rsi_period', 14)
        upper_threshold = data.get('upper_threshold', 70)
        lower_threshold = data.get('lower_threshold', 30)
        
        if not symbol:
            return jsonify({'error': 'Symbol is required'}), 400
        
        if not os.path.exists(DATA_FILE):
            return jsonify({'error': 'Data file not found'}), 404
        
        df = pd.read_csv(DATA_FILE)
        df = df[df['Symbol'] == symbol].copy()
        
        if df.empty:
            return jsonify({'error': f'No data found for symbol {symbol}'}), 404
        
        # Parse dates and sort
        df['Date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y')
        df = df.sort_values('Date')
        
        # Clean numeric columns
        for col in ['Open', 'High', 'Low', 'Close']:
            df[col] = df[col].apply(clean_numeric_value)
        
        # Calculate RSI using standard formula
        df['RSI'] = calculate_rsi(df['Close'], period=rsi_period)
        
        # Generate signals with CUSTOM logic
        signals = generate_signals(df, rsi_period, upper_threshold, lower_threshold)
        
        # Prepare chart data
        chart_data = []
        for _, row in df.iterrows():
            chart_data.append({
                'date': row['Date'].strftime('%Y-%m-%d'),
                'close': float(row['Close']),
                'rsi': float(row['RSI']) if not pd.isna(row['RSI']) else None
            })
        
        # Determine latest signal status (CUSTOM LOGIC)
        latest_signal = None
        latest_rsi = float(df['RSI'].iloc[-1]) if not pd.isna(df['RSI'].iloc[-1]) else None
        
        if latest_rsi:
            if latest_rsi > upper_threshold:
                latest_signal = {
                    'type': 'OVERBOUGHT',
                    'message': f'RSI is {latest_rsi:.2f} - Strong momentum, consider buying'
                }
            elif latest_rsi < lower_threshold:
                latest_signal = {
                    'type': 'OVERSOLD',
                    'message': f'RSI is {latest_rsi:.2f} - Weak momentum, consider selling'
                }
            else:
                latest_signal = {
                    'type': 'NEUTRAL',
                    'message': f'RSI is {latest_rsi:.2f} - No clear signal, market is neutral'
                }
        
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
            'rsi_interpretation': {
                'upper_threshold': upper_threshold,
                'lower_threshold': lower_threshold,
                'note': 'CUSTOM LOGIC: RSI > upper = BUY (strong momentum), RSI < lower = SELL (weak momentum)'
            }
        })
    
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

if __name__ == '__main__':
    print("\n" + "="*80)
    print("🚀 Stock Market Analyzer API - CUSTOM LOGIC VERSION")
    print("="*80)
    print("\n📊 Data File:", DATA_FILE)
    print("   Exists:", os.path.exists(DATA_FILE))
    
    if os.path.exists(DATA_FILE):
        try:
            df = pd.read_csv(DATA_FILE)
            symbols = df['Symbol'].unique()
            print(f"   Symbols found: {list(symbols)}")
        except Exception as e:
            print(f"   Error reading file: {e}")
    
    print("\n✅ CUSTOM LOGIC IMPLEMENTED:")
    print("   ⚠️  WARNING: This uses REVERSED RSI interpretation!")
    print("   1. BUY when RSI crosses ABOVE upper threshold (high momentum)")
    print("   2. SELL when RSI crosses BELOW lower threshold (low momentum)")
    print("   3. This is opposite of traditional trading interpretation")
    
    print("\n🌐 Server will be available at:")
    print("   - http://localhost:8080")
    print("   - http://127.0.0.1:8080")
    print("   - http://0.0.0.0:8080")
    
    print("\n🔍 Test endpoints:")
    print("   - http://localhost:8080/")
    print("   - http://localhost:8080/api/health")
    print("   - http://localhost:8080/api/symbols")
    
    print("\n⚠️  Press CTRL+C to stop the server")
    print("="*80 + "\n")
    
    # Use port 8080
    app.run(
        host='0.0.0.0',
        port=8080,
        debug=True,
        use_reloader=False,
        threaded=True
    )