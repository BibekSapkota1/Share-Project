
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Settings, Bell, AlertCircle, Database } from 'lucide-react';

// CHANGE THIS IF USING ALTERNATIVE SERVER
const API_URL = 'http://localhost:8080/api';  // Changed from 5000 to 8080

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [symbols, setSymbols] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [chartData, setChartData] = useState([]);
  const [signals, setSignals] = useState([]);
  const [latestSignal, setLatestSignal] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // RSI Settings
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [upperThreshold, setUpperThreshold] = useState(70);
  const [lowerThreshold, setLowerThreshold] = useState(30);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch available symbols on mount
  useEffect(() => {
    fetchSymbols();
  }, []);

  const fetchSymbols = async () => {
    try {
      console.log('Fetching symbols from:', `${API_URL}/symbols`);
      const response = await fetch(`${API_URL}/symbols`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Symbols received:', data);
      
      if (response.ok) {
        setSymbols(data.symbols);
        if (data.symbols.length > 0) {
          setSelectedSymbol(data.symbols[0]);
        }
      } else {
        showNotificationMessage(data.error, 'error');
      }
    } catch (error) {
      console.error('Error fetching symbols:', error);
      showNotificationMessage(
        `Cannot connect to backend. Make sure it's running on port ${API_URL.includes('8080') ? '8080' : '5000'}`,
        'error'
      );
    }
  };

  const analyzeData = async () => {
    if (!selectedSymbol) {
      showNotificationMessage('Please select a symbol', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedSymbol,
          rsi_period: rsiPeriod,
          upper_threshold: upperThreshold,
          lower_threshold: lowerThreshold
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setChartData(data.chart_data);
        setSignals(data.signals);
        setLatestSignal(data.latest_signal);
        setStatistics(data.statistics);
        
        if (data.latest_signal && data.latest_signal.type !== 'NEUTRAL') {
          showNotificationMessage(data.latest_signal.message, 
            data.latest_signal.type === 'OVERSOLD' ? 'buy' : 'sell');
        }
      } else {
        showNotificationMessage(data.error, 'error');
      }
    } catch (error) {
      showNotificationMessage('Error analyzing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotificationMessage = (message, type) => {
    setNotification({ message, type });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  useEffect(() => {
    if (selectedSymbol) {
      analyzeData();
    }
  }, [selectedSymbol, rsiPeriod, upperThreshold, lowerThreshold]);

  return (
    <div className="app">
      {/* Animated background */}
      <div className="background-grid"></div>
      
      {/* Notification */}
      {showNotification && notification && (
        <div className={`notification ${notification.type} ${showNotification ? 'show' : ''}`}>
          <Bell size={18} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Activity size={32} strokeWidth={2.5} />
            <h1>MARKET<span>PULSE</span></h1>
          </div>
          <nav className="nav">
            <button 
              className={activeTab === 'home' ? 'active' : ''}
              onClick={() => setActiveTab('home')}
            >
              Home
            </button>
            <button 
              className={activeTab === 'analysis' ? 'active' : ''}
              onClick={() => setActiveTab('analysis')}
            >
              RSI Analysis
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'home' ? (
          <div className="home-page">
            <div className="hero">
              <div className="hero-content">
                <h2 className="hero-title">
                  Smart Trading
                  <br />
                  <span className="highlight">Made Simple</span>
                </h2>
                <p className="hero-subtitle">
                  Advanced RSI analysis and real-time trading signals powered by data science
                </p>
                <button 
                  className="cta-button"
                  onClick={() => setActiveTab('analysis')}
                >
                  Start Analysis
                  <TrendingUp size={20} />
                </button>
              </div>
              
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">📊</div>
                  <h3>RSI Analysis</h3>
                  <p>Customizable RSI periods and thresholds for precise market timing</p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">🎯</div>
                  <h3>Smart Signals</h3>
                  <p>Automatic buy and sell signals based on your RSI strategy</p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">📈</div>
                  <h3>Visual Charts</h3>
                  <p>Interactive charts with price action and RSI indicators</p>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">⚡</div>
                  <h3>Real-time Alerts</h3>
                  <p>Instant notifications when RSI crosses your thresholds</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="analysis-page">
            <div className="analysis-layout">
              {/* Left Sidebar - Controls */}
              <aside className="controls-panel">
                <div className="panel-section">
                  <h3 className="panel-title">
                    <Database size={20} />
                    Select Symbol
                  </h3>
                  <div className="symbol-selector">
                    <select
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value)}
                      className="symbol-select"
                    >
                      {symbols.map(symbol => (
                        <option key={symbol} value={symbol}>{symbol}</option>
                      ))}
                    </select>
                  </div>
                  
                  {statistics && (
                    <div className="upload-info">
                      <div className="info-row">
                        <span>Symbol:</span>
                        <strong>{selectedSymbol}</strong>
                      </div>
                      <div className="info-row">
                        <span>Current Price:</span>
                        <strong>NPR {statistics.current_price?.toFixed(2)}</strong>
                      </div>
                      <div className="info-row">
                        <span>Date Range:</span>
                        <strong>{statistics.date_range?.start} to {statistics.date_range?.end}</strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="panel-section">
                  <h3 className="panel-title">
                    <Settings size={20} />
                    RSI Settings
                  </h3>
                  
                  <div className="setting-group">
                    <label>RSI Period</label>
                    <input
                      type="number"
                      value={rsiPeriod}
                      onChange={(e) => setRsiPeriod(parseInt(e.target.value))}
                      min="2"
                      max="100"
                      className="setting-input"
                    />
                    <span className="setting-hint">Default: 14 days</span>
                  </div>

                  <div className="setting-group">
                    <label>Upper Threshold (Sell)</label>
                    <input
                      type="number"
                      value={upperThreshold}
                      onChange={(e) => setUpperThreshold(parseInt(e.target.value))}
                      min="50"
                      max="100"
                      className="setting-input"
                    />
                    <div className="threshold-bar">
                      <div className="threshold-fill sell" style={{width: `${upperThreshold}%`}}></div>
                    </div>
                  </div>

                  <div className="setting-group">
                    <label>Lower Threshold (Buy)</label>
                    <input
                      type="number"
                      value={lowerThreshold}
                      onChange={(e) => setLowerThreshold(parseInt(e.target.value))}
                      min="0"
                      max="50"
                      className="setting-input"
                    />
                    <div className="threshold-bar">
                      <div className="threshold-fill buy" style={{width: `${lowerThreshold}%`}}></div>
                    </div>
                  </div>

                  <button 
                    className="analyze-button"
                    onClick={analyzeData}
                    disabled={!selectedSymbol || loading}
                  >
                    {loading ? 'Analyzing...' : 'Analyze Data'}
                  </button>
                </div>

                {latestSignal && (
                  <div className={`signal-alert ${latestSignal.type.toLowerCase()}`}>
                    <AlertCircle size={24} />
                    <div>
                      <div className="signal-type">{latestSignal.type}</div>
                      <div className="signal-message">{latestSignal.message}</div>
                    </div>
                  </div>
                )}

                {statistics && (
                  <div className="panel-section">
                    <h3 className="panel-title">Statistics</h3>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <span>Total Signals</span>
                        <strong>{statistics.total_signals}</strong>
                      </div>
                      <div className="stat-item buy">
                        <span>Buy Signals</span>
                        <strong>{statistics.buy_signals}</strong>
                      </div>
                      <div className="stat-item sell">
                        <span>Sell Signals</span>
                        <strong>{statistics.sell_signals}</strong>
                      </div>
                      <div className="stat-item">
                        <span>Current RSI</span>
                        <strong>{statistics.current_rsi?.toFixed(2) || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </aside>

              {/* Main Chart Area */}
              <div className="chart-area">
                {chartData.length > 0 ? (
                  <>
                    <div className="chart-container">
                      <h3 className="chart-title">Price Chart</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#64748b"
                            tick={{fill: '#94a3b8'}}
                          />
                          <YAxis 
                            stroke="#64748b"
                            tick={{fill: '#94a3b8'}}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#0f1419',
                              border: '1px solid #1e293b',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="close" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={false}
                            name="Close Price"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="chart-container">
                      <h3 className="chart-title">RSI Indicator</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" />
                          <XAxis 
                            dataKey="date" 
                            stroke="#64748b"
                            tick={{fill: '#94a3b8'}}
                          />
                          <YAxis 
                            domain={[0, 100]}
                            stroke="#64748b"
                            tick={{fill: '#94a3b8'}}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: '#0f1419',
                              border: '1px solid #1e293b',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <ReferenceLine 
                            y={upperThreshold} 
                            stroke="#ef4444" 
                            strokeDasharray="3 3"
                            label="Overbought"
                          />
                          <ReferenceLine 
                            y={lowerThreshold} 
                            stroke="#10b981" 
                            strokeDasharray="3 3"
                            label="Oversold"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="rsi" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={false}
                            name="RSI"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {signals.length > 0 && (
                      <div className="signals-list">
                        <h3 className="chart-title">Trading Signals</h3>
                        <div className="signals-container">
                          {signals.slice().reverse().map((signal, index) => (
                            <div key={index} className={`signal-item ${signal.type.toLowerCase()}`}>
                              {signal.type === 'BUY' ? (
                                <TrendingUp size={20} />
                              ) : (
                                <TrendingDown size={20} />
                              )}
                              <div className="signal-details">
                                <div className="signal-header">
                                  <strong>{signal.type}</strong>
                                  <span className="signal-date">{signal.date}</span>
                                </div>
                                <div className="signal-info">
                                  <span>Price: ${signal.price.toFixed(2)}</span>
                                  <span>RSI: {signal.rsi.toFixed(2)}</span>
                                </div>
                                <div className="signal-msg">{signal.message}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-state">
                    <Activity size={64} />
                    <h3>No Data Yet</h3>
                    <p>Select a symbol and configure your RSI settings to view analysis</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
          background: #0a0e1a;
          color: #e2e8f0;
        }

        .app {
          min-height: 100vh;
          position: relative;
        }

        .background-grid {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 0;
          pointer-events: none;
        }

        .header {
          position: relative;
          z-index: 10;
          background: rgba(15, 20, 25, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #1e293b;
        }

        .header-content {
          max-width: 1600px;
          margin: 0 auto;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo svg {
          color: #10b981;
          filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.5));
        }

        .logo h1 {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #f1f5f9;
        }

        .logo h1 span {
          color: #10b981;
        }

        .nav {
          display: flex;
          gap: 0.5rem;
        }

        .nav button {
          background: none;
          border: none;
          color: #94a3b8;
          padding: 0.75rem 1.5rem;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: inherit;
          transition: all 0.3s ease;
          border-radius: 8px;
          position: relative;
        }

        .nav button:hover {
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .nav button.active {
          color: #10b981;
          background: rgba(16, 185, 129, 0.15);
        }

        .main-content {
          position: relative;
          z-index: 1;
          max-width: 1600px;
          margin: 0 auto;
          padding: 2rem;
        }

        .home-page {
          min-height: calc(100vh - 120px);
        }

        .hero {
          padding: 4rem 0;
        }

        .hero-content {
          text-align: center;
          margin-bottom: 4rem;
        }

        .hero-title {
          font-size: 4.5rem;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -0.03em;
          animation: fadeInUp 0.8s ease;
        }

        .highlight {
          color: #10b981;
          text-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #94a3b8;
          margin-bottom: 2.5rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          animation: fadeInUp 0.8s ease 0.2s backwards;
        }

        .cta-button {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          font-family: inherit;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
          animation: fadeInUp 0.8s ease 0.4s backwards;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .feature-card {
          background: rgba(15, 20, 25, 0.6);
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 2rem;
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease backwards;
        }

        .feature-card:nth-child(1) { animation-delay: 0.5s; }
        .feature-card:nth-child(2) { animation-delay: 0.6s; }
        .feature-card:nth-child(3) { animation-delay: 0.7s; }
        .feature-card:nth-child(4) { animation-delay: 0.8s; }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: #10b981;
          box-shadow: 0 8px 30px rgba(16, 185, 129, 0.2);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          font-size: 1.3rem;
          margin-bottom: 0.75rem;
          color: #f1f5f9;
        }

        .feature-card p {
          color: #94a3b8;
          line-height: 1.6;
        }

        .analysis-layout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 2rem;
          min-height: calc(100vh - 120px);
        }

        .controls-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .panel-section {
          background: rgba(15, 20, 25, 0.8);
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 1.5rem;
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          color: #10b981;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .upload-zone {
          margin-bottom: 1rem;
        }

        .symbol-selector {
          margin-bottom: 1rem;
        }

        .symbol-select {
          width: 100%;
          padding: 0.75rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid #1e293b;
          border-radius: 8px;
          color: #f1f5f9;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .symbol-select:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .symbol-select option {
          background: #0f1419;
          padding: 0.5rem;
        }

        .file-input {
          display: none;
        }

        .upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          border: 2px dashed #1e293b;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 140px;
          background: rgba(30, 41, 59, 0.3);
        }

        .upload-label:hover {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        .upload-label svg {
          color: #64748b;
          margin-bottom: 0.75rem;
        }

        .upload-label span {
          color: #94a3b8;
          font-size: 0.95rem;
        }

        .file-name {
          font-weight: 600;
          color: #10b981;
          margin-bottom: 0.25rem;
          font-size: 0.95rem;
        }

        .file-size {
          color: #64748b;
          font-size: 0.85rem;
        }

        .upload-info {
          background: rgba(30, 41, 59, 0.3);
          border-radius: 8px;
          padding: 1rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.9rem;
        }

        .info-row span {
          color: #94a3b8;
        }

        .info-row strong {
          color: #f1f5f9;
        }

        .setting-group {
          margin-bottom: 1.5rem;
        }

        .setting-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #cbd5e1;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .setting-input {
          width: 100%;
          padding: 0.75rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid #1e293b;
          border-radius: 8px;
          color: #f1f5f9;
          font-family: inherit;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .setting-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .setting-hint {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.8rem;
          color: #64748b;
        }

        .threshold-bar {
          width: 100%;
          height: 6px;
          background: rgba(30, 41, 59, 0.5);
          border-radius: 3px;
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .threshold-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .threshold-fill.buy {
          background: linear-gradient(90deg, #10b981, #059669);
        }

        .threshold-fill.sell {
          background: linear-gradient(90deg, #ef4444, #dc2626);
        }

        .analyze-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s ease;
          margin-top: 0.5rem;
        }

        .analyze-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
        }

        .analyze-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .signal-alert {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          border-radius: 12px;
          align-items: flex-start;
          animation: slideIn 0.4s ease;
        }

        .signal-alert.oversold {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .signal-alert.overbought {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .signal-alert.neutral {
          background: rgba(100, 116, 139, 0.1);
          border: 1px solid rgba(100, 116, 139, 0.3);
          color: #94a3b8;
        }

        .signal-type {
          font-weight: 700;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .signal-message {
          font-size: 0.9rem;
          margin-top: 0.25rem;
          opacity: 0.9;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .stat-item {
          padding: 1rem;
          background: rgba(30, 41, 59, 0.3);
          border-radius: 8px;
          text-align: center;
        }

        .stat-item span {
          display: block;
          font-size: 0.8rem;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }

        .stat-item strong {
          font-size: 1.5rem;
          color: #f1f5f9;
        }

        .stat-item.buy strong {
          color: #10b981;
        }

        .stat-item.sell strong {
          color: #ef4444;
        }

        .chart-area {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .chart-container {
          background: rgba(15, 20, 25, 0.8);
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 1.5rem;
        }

        .chart-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #cbd5e1;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 500px;
          text-align: center;
        }

        .empty-state svg {
          color: #334155;
          margin-bottom: 1.5rem;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          color: #cbd5e1;
          margin-bottom: 0.75rem;
        }

        .empty-state p {
          color: #64748b;
          max-width: 400px;
        }

        .signals-list {
          background: rgba(15, 20, 25, 0.8);
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 1.5rem;
        }

        .signals-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 500px;
          overflow-y: auto;
        }

        .signals-container::-webkit-scrollbar {
          width: 6px;
        }

        .signals-container::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.3);
          border-radius: 3px;
        }

        .signals-container::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 3px;
        }

        .signal-item {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          border-radius: 12px;
          border: 1px solid;
          transition: all 0.3s ease;
        }

        .signal-item.buy {
          background: rgba(16, 185, 129, 0.05);
          border-color: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .signal-item.sell {
          background: rgba(239, 68, 68, 0.05);
          border-color: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .signal-item:hover {
          transform: translateX(4px);
        }

        .signal-details {
          flex: 1;
        }

        .signal-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .signal-header strong {
          font-size: 0.95rem;
          font-weight: 700;
        }

        .signal-date {
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .signal-info {
          display: flex;
          gap: 1.5rem;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          opacity: 0.8;
        }

        .signal-msg {
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .notification {
          position: fixed;
          top: 100px;
          right: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          z-index: 1000;
          transform: translateX(400px);
          transition: transform 0.4s ease;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .notification.show {
          transform: translateX(0);
        }

        .notification.success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .notification.error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .notification.buy {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .notification.sell {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1200px) {
          .analysis-layout {
            grid-template-columns: 1fr;
          }

          .controls-panel {
            grid-row: 2;
          }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 3rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default App;

// ------------ App.py --


// # """
// # Alternative Flask server startup with enhanced debugging
// # Use this if you're getting 403 errors
// # """

// # from flask import Flask, request, jsonify
// # from flask_cors import CORS
// # import pandas as pd
// # import numpy as np
// # from datetime import datetime
// # import os

// # app = Flask(__name__)

// # # Very permissive CORS - allows all origins
// # CORS(app, resources={r"/*": {"origins": "*"}})

// # # Disable Flask security warnings for development
// # app.config['DEBUG'] = True
// # app.config['ENV'] = 'development'

// # # Path to data file
// # DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'data_sample.csv')

// # def clean_numeric_value(value):
// #     """Clean numeric values that may have commas"""
// #     if isinstance(value, str):
// #         return float(value.replace(',', ''))
// #     return float(value)

// # def calculate_rsi(data, period=14):
// #     """Calculate RSI for given data"""
// #     delta = data.diff()
// #     gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
// #     loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
// #     rs = gain / loss
// #     rsi = 100 - (100 / (1 + rs))
// #     return rsi

// # def generate_signals(df, rsi_period=14, upper_threshold=70, lower_threshold=30):
// #     """Generate buy/sell signals based on RSI"""
// #     df['RSI'] = calculate_rsi(df['Close'], period=rsi_period)
    
// #     signals = []
// #     for i in range(1, len(df)):
// #         if df['RSI'].iloc[i-1] <= lower_threshold and df['RSI'].iloc[i] > lower_threshold:
// #             signals.append({
// #                 'date': df['Date'].iloc[i],
// #                 'type': 'BUY',
// #                 'price': float(df['Close'].iloc[i]),
// #                 'rsi': float(df['RSI'].iloc[i]),
// #                 'message': f'RSI crossed above {lower_threshold}'
// #             })
        
// #         if df['RSI'].iloc[i-1] >= upper_threshold and df['RSI'].iloc[i] < upper_threshold:
// #             signals.append({
// #                 'date': df['Date'].iloc[i],
// #                 'type': 'SELL',
// #                 'price': float(df['Close'].iloc[i]),
// #                 'rsi': float(df['RSI'].iloc[i]),
// #                 'message': f'RSI crossed below {upper_threshold}'
// #             })
    
// #     return signals

// # @app.route('/', methods=['GET'])
// # def home():
// #     """Root endpoint"""
// #     return jsonify({
// #         'app': 'Stock Market Analyzer API',
// #         'status': 'running',
// #         'version': '1.0',
// #         'endpoints': {
// #             'health': '/api/health',
// #             'symbols': '/api/symbols',
// #             'analyze': '/api/analyze (POST)'
// #         }
// #     })

// # @app.route('/api/health', methods=['GET'])
// # def health_check():
// #     """Health check endpoint"""
// #     return jsonify({
// #         'status': 'ok',
// #         'timestamp': datetime.now().isoformat(),
// #         'data_file_exists': os.path.exists(DATA_FILE)
// #     })

// # @app.route('/api/symbols', methods=['GET'])
// # def get_symbols():
// #     """Get list of available symbols"""
// #     try:
// #         if not os.path.exists(DATA_FILE):
// #             return jsonify({'error': f'Data file not found at {DATA_FILE}'}), 404
        
// #         df = pd.read_csv(DATA_FILE)
// #         symbols = sorted(df['Symbol'].unique().tolist())
        
// #         return jsonify({
// #             'symbols': symbols,
// #             'total': len(symbols),
// #             'data_file': DATA_FILE
// #         })
    
// #     except Exception as e:
// #         return jsonify({'error': str(e), 'file': DATA_FILE}), 500

// # @app.route('/api/analyze', methods=['POST', 'OPTIONS'])
// # def analyze_data():
// #     """Analyze stock data with RSI for a specific symbol"""
// #     if request.method == 'OPTIONS':
// #         return '', 204
    
// #     try:
// #         data = request.json
// #         symbol = data.get('symbol')
// #         rsi_period = data.get('rsi_period', 14)
// #         upper_threshold = data.get('upper_threshold', 70)
// #         lower_threshold = data.get('lower_threshold', 30)
        
// #         if not symbol:
// #             return jsonify({'error': 'Symbol is required'}), 400
        
// #         if not os.path.exists(DATA_FILE):
// #             return jsonify({'error': 'Data file not found'}), 404
        
// #         df = pd.read_csv(DATA_FILE)
// #         df = df[df['Symbol'] == symbol].copy()
        
// #         if df.empty:
// #             return jsonify({'error': f'No data found for symbol {symbol}'}), 404
        
// #         df['Date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y')
// #         df = df.sort_values('Date')
        
// #         for col in ['Open', 'High', 'Low', 'Close']:
// #             df[col] = df[col].apply(clean_numeric_value)
        
// #         df['RSI'] = calculate_rsi(df['Close'], period=rsi_period)
// #         signals = generate_signals(df, rsi_period, upper_threshold, lower_threshold)
        
// #         chart_data = []
// #         for _, row in df.iterrows():
// #             chart_data.append({
// #                 'date': row['Date'].strftime('%Y-%m-%d'),
// #                 'close': float(row['Close']),
// #                 'rsi': float(row['RSI']) if not pd.isna(row['RSI']) else None
// #             })
        
// #         latest_signal = None
// #         latest_rsi = float(df['RSI'].iloc[-1]) if not pd.isna(df['RSI'].iloc[-1]) else None
        
// #         if latest_rsi:
// #             if latest_rsi > upper_threshold:
// #                 latest_signal = {
// #                     'type': 'OVERBOUGHT',
// #                     'message': f'RSI is {latest_rsi:.2f} - Consider selling'
// #                 }
// #             elif latest_rsi < lower_threshold:
// #                 latest_signal = {
// #                     'type': 'OVERSOLD',
// #                     'message': f'RSI is {latest_rsi:.2f} - Consider buying'
// #                 }
// #             else:
// #                 latest_signal = {
// #                     'type': 'NEUTRAL',
// #                     'message': f'RSI is {latest_rsi:.2f} - No clear signal'
// #                 }
        
// #         return jsonify({
// #             'symbol': symbol,
// #             'chart_data': chart_data,
// #             'signals': signals,
// #             'latest_signal': latest_signal,
// #             'statistics': {
// #                 'total_signals': len(signals),
// #                 'buy_signals': len([s for s in signals if s['type'] == 'BUY']),
// #                 'sell_signals': len([s for s in signals if s['type'] == 'SELL']),
// #                 'current_rsi': latest_rsi,
// #                 'avg_rsi': float(df['RSI'].mean()) if not df['RSI'].isna().all() else None,
// #                 'current_price': float(df['Close'].iloc[-1]),
// #                 'date_range': {
// #                     'start': df['Date'].min().strftime('%Y-%m-%d'),
// #                     'end': df['Date'].max().strftime('%Y-%m-%d')
// #                 }
// #             }
// #         })
    
// #     except Exception as e:
// #         import traceback
// #         return jsonify({
// #             'error': str(e),
// #             'traceback': traceback.format_exc()
// #         }), 500

// # if __name__ == '__main__':
// #     print("\n" + "="*70)
// #     print("🚀 Stock Market Analyzer API - Alternative Server")
// #     print("="*70)
// #     print("\n📊 Data File:", DATA_FILE)
// #     print("   Exists:", os.path.exists(DATA_FILE))
    
// #     if os.path.exists(DATA_FILE):
// #         try:
// #             df = pd.read_csv(DATA_FILE)
// #             symbols = df['Symbol'].unique()
// #             print(f"   Symbols found: {list(symbols)}")
// #         except Exception as e:
// #             print(f"   Error reading file: {e}")
    
// #     print("\n📍 Server will be available at:")
// #     print("   - http://localhost:8080")
// #     print("   - http://127.0.0.1:8080")
// #     print("   - http://0.0.0.0:8080")
    
// #     print("\n🔍 Test endpoints:")
// #     print("   - http://localhost:8080/")
// #     print("   - http://localhost:8080/api/health")
// #     print("   - http://localhost:8080/api/symbols")
    
// #     print("\n⚠️  Press CTRL+C to stop the server")
// #     print("="*70 + "\n")
    
// #     # Use a different port (8080) to avoid conflicts
// #     app.run(
// #         host='0.0.0.0',
// #         port=8080,
// #         debug=True,
// #         use_reloader=False,
// #         threaded=True
// #     )


// """
// Flask server for Stock Market RSI Analysis
// CORRECTED VERSION with proper RSI calculation and signal interpretation
// """

// from flask import Flask, request, jsonify
// from flask_cors import CORS
// import pandas as pd
// import numpy as np
// from datetime import datetime
// import os

// app = Flask(__name__)

// # Very permissive CORS - allows all origins
// CORS(app, resources={r"/*": {"origins": "*"}})

// # Disable Flask security warnings for development
// app.config['DEBUG'] = True
// app.config['ENV'] = 'development'

// # Path to data file
// DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'data_sample.csv')

// def clean_numeric_value(value):
//     """Clean numeric values that may have commas"""
//     if isinstance(value, str):
//         return float(value.replace(',', ''))
//     return float(value)

// def calculate_rsi(prices, period=14):
//     """
//     Calculate RSI using the standard Wilder's smoothing method
//     This is the industry-standard RSI calculation
    
//     Formula:
//     RSI = 100 - (100 / (1 + RS))
//     where RS = Average Gain / Average Loss
    
//     Uses Wilder's smoothing for averaging (EMA-like approach)
//     """
//     # Calculate price changes
//     delta = prices.diff()
    
//     # Separate gains and losses
//     gains = delta.where(delta > 0, 0)
//     losses = -delta.where(delta < 0, 0)
    
//     # First RSI calculation uses simple average
//     avg_gain = gains.rolling(window=period, min_periods=period).mean()
//     avg_loss = losses.rolling(window=period, min_periods=period).mean()
    
//     # Subsequent values use Wilder's smoothing
//     # This is more accurate than simple rolling average
//     for i in range(period, len(gains)):
//         avg_gain.iloc[i] = (avg_gain.iloc[i-1] * (period - 1) + gains.iloc[i]) / period
//         avg_loss.iloc[i] = (avg_loss.iloc[i-1] * (period - 1) + losses.iloc[i]) / period
    
//     # Calculate RS and RSI
//     rs = avg_gain / avg_loss
//     rsi = 100 - (100 / (1 + rs))
    
//     return rsi

// def generate_signals(df, rsi_period=14, upper_threshold=70, lower_threshold=30):
//     """
//     Generate buy/sell signals based on RSI crossovers
    
//     CORRECTED LOGIC:
//     - BUY signal: When RSI crosses BELOW lower threshold (oversold -> potential reversal up)
//     - SELL signal: When RSI crosses ABOVE upper threshold (overbought -> potential reversal down)
    
//     This is the standard interpretation used by traders
//     """
//     df['RSI'] = calculate_rsi(df['Close'], period=rsi_period)
    
//     signals = []
//     for i in range(1, len(df)):
//         prev_rsi = df['RSI'].iloc[i-1]
//         curr_rsi = df['RSI'].iloc[i]
        
//         # Skip if RSI values are NaN
//         if pd.isna(prev_rsi) or pd.isna(curr_rsi):
//             continue
        
//         # BUY signal: RSI crosses BELOW lower threshold (entering oversold territory)
//         # This suggests the stock might be oversold and could bounce back
//         if prev_rsi >= lower_threshold and curr_rsi < lower_threshold:
//             signals.append({
//                 'date': df['Date'].iloc[i],
//                 'type': 'BUY',
//                 'price': float(df['Close'].iloc[i]),
//                 'rsi': float(curr_rsi),
//                 'message': f'RSI crossed below {lower_threshold} - Oversold condition, potential buy opportunity'
//             })
        
//         # SELL signal: RSI crosses ABOVE upper threshold (entering overbought territory)
//         # This suggests the stock might be overbought and could pull back
//         elif prev_rsi <= upper_threshold and curr_rsi > upper_threshold:
//             signals.append({
//                 'date': df['Date'].iloc[i],
//                 'type': 'SELL',
//                 'price': float(df['Close'].iloc[i]),
//                 'rsi': float(curr_rsi),
//                 'message': f'RSI crossed above {upper_threshold} - Overbought condition, potential sell opportunity'
//             })
    
//     return signals

// @app.route('/', methods=['GET'])
// def home():
//     """Root endpoint"""
//     return jsonify({
//         'app': 'Stock Market Analyzer API (CORRECTED VERSION)',
//         'status': 'running',
//         'version': '2.0',
//         'changes': [
//             'Fixed RSI calculation using Wilder\'s smoothing method',
//             'Corrected signal logic: Buy on oversold, Sell on overbought',
//             'Improved accuracy matching industry standards'
//         ],
//         'endpoints': {
//             'health': '/api/health',
//             'symbols': '/api/symbols',
//             'analyze': '/api/analyze (POST)'
//         }
//     })

// @app.route('/api/health', methods=['GET'])
// def health_check():
//     """Health check endpoint"""
//     return jsonify({
//         'status': 'ok',
//         'timestamp': datetime.now().isoformat(),
//         'data_file_exists': os.path.exists(DATA_FILE)
//     })

// @app.route('/api/symbols', methods=['GET'])
// def get_symbols():
//     """Get list of available symbols"""
//     try:
//         if not os.path.exists(DATA_FILE):
//             return jsonify({'error': f'Data file not found at {DATA_FILE}'}), 404
        
//         df = pd.read_csv(DATA_FILE)
//         symbols = sorted(df['Symbol'].unique().tolist())
        
//         return jsonify({
//             'symbols': symbols,
//             'total': len(symbols),
//             'data_file': DATA_FILE
//         })
    
//     except Exception as e:
//         return jsonify({'error': str(e), 'file': DATA_FILE}), 500

// @app.route('/api/analyze', methods=['POST', 'OPTIONS'])
// def analyze_data():
//     """Analyze stock data with corrected RSI calculation and signal interpretation"""
//     if request.method == 'OPTIONS':
//         return '', 204
    
//     try:
//         data = request.json
//         symbol = data.get('symbol')
//         rsi_period = data.get('rsi_period', 14)
//         upper_threshold = data.get('upper_threshold', 70)
//         lower_threshold = data.get('lower_threshold', 30)
        
//         if not symbol:
//             return jsonify({'error': 'Symbol is required'}), 400
        
//         if not os.path.exists(DATA_FILE):
//             return jsonify({'error': 'Data file not found'}), 404
        
//         df = pd.read_csv(DATA_FILE)
//         df = df[df['Symbol'] == symbol].copy()
        
//         if df.empty:
//             return jsonify({'error': f'No data found for symbol {symbol}'}), 404
        
//         # Parse dates and sort
//         df['Date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y')
//         df = df.sort_values('Date')
        
//         # Clean numeric columns
//         for col in ['Open', 'High', 'Low', 'Close']:
//             df[col] = df[col].apply(clean_numeric_value)
        
//         # Calculate RSI using corrected formula
//         df['RSI'] = calculate_rsi(df['Close'], period=rsi_period)
        
//         # Generate signals with corrected logic
//         signals = generate_signals(df, rsi_period, upper_threshold, lower_threshold)
        
//         # Prepare chart data
//         chart_data = []
//         for _, row in df.iterrows():
//             chart_data.append({
//                 'date': row['Date'].strftime('%Y-%m-%d'),
//                 'close': float(row['Close']),
//                 'rsi': float(row['RSI']) if not pd.isna(row['RSI']) else None
//             })
        
//         # Determine latest signal status
//         latest_signal = None
//         latest_rsi = float(df['RSI'].iloc[-1]) if not pd.isna(df['RSI'].iloc[-1]) else None
        
//         if latest_rsi:
//             if latest_rsi > upper_threshold:
//                 latest_signal = {
//                     'type': 'OVERBOUGHT',
//                     'message': f'RSI is {latest_rsi:.2f} - Stock may be overbought, consider selling'
//                 }
//             elif latest_rsi < lower_threshold:
//                 latest_signal = {
//                     'type': 'OVERSOLD',
//                     'message': f'RSI is {latest_rsi:.2f} - Stock may be oversold, consider buying'
//                 }
//             else:
//                 latest_signal = {
//                     'type': 'NEUTRAL',
//                     'message': f'RSI is {latest_rsi:.2f} - No clear signal, market is neutral'
//                 }
        
//         return jsonify({
//             'symbol': symbol,
//             'chart_data': chart_data,
//             'signals': signals,
//             'latest_signal': latest_signal,
//             'statistics': {
//                 'total_signals': len(signals),
//                 'buy_signals': len([s for s in signals if s['type'] == 'BUY']),
//                 'sell_signals': len([s for s in signals if s['type'] == 'SELL']),
//                 'current_rsi': latest_rsi,
//                 'avg_rsi': float(df['RSI'].mean()) if not df['RSI'].isna().all() else None,
//                 'current_price': float(df['Close'].iloc[-1]),
//                 'date_range': {
//                     'start': df['Date'].min().strftime('%Y-%m-%d'),
//                     'end': df['Date'].max().strftime('%Y-%m-%d')
//                 }
//             },
//             'rsi_interpretation': {
//                 'upper_threshold': upper_threshold,
//                 'lower_threshold': lower_threshold,
//                 'note': 'RSI > upper threshold = OVERBOUGHT (consider SELLING), RSI < lower threshold = OVERSOLD (consider BUYING)'
//             }
//         })
    
//     except Exception as e:
//         import traceback
//         return jsonify({
//             'error': str(e),
//             'traceback': traceback.format_exc()
//         }), 500

// if __name__ == '__main__':
//     print("\n" + "="*80)
//     print("🚀 Stock Market Analyzer API - CORRECTED VERSION")
//     print("="*80)
//     print("\n📊 Data File:", DATA_FILE)
//     print("   Exists:", os.path.exists(DATA_FILE))
    
//     if os.path.exists(DATA_FILE):
//         try:
//             df = pd.read_csv(DATA_FILE)
//             symbols = df['Symbol'].unique()
//             print(f"   Symbols found: {list(symbols)}")
//         except Exception as e:
//             print(f"   Error reading file: {e}")
    
//     print("\n✅ CORRECTIONS IMPLEMENTED:")
//     print("   1. RSI calculation now uses Wilder's smoothing method")
//     print("   2. Signal logic corrected:")
//     print("      - BUY when RSI crosses BELOW lower threshold (oversold)")
//     print("      - SELL when RSI crosses ABOVE upper threshold (overbought)")
//     print("   3. More accurate RSI values matching industry standards")
    
//     print("\n🌐 Server will be available at:")
//     print("   - http://localhost:8080")
//     print("   - http://127.0.0.1:8080")
//     print("   - http://0.0.0.0:8080")
    
//     print("\n🔍 Test endpoints:")
//     print("   - http://localhost:8080/")
//     print("   - http://localhost:8080/api/health")
//     print("   - http://localhost:8080/api/symbols")
    
//     print("\n⚠️  Press CTRL+C to stop the server")
//     print("="*80 + "\n")
    
//     # Use port 8080
//     app.run(
//         host='0.0.0.0',
//         port=8080,
//         debug=True,
//         use_reloader=False,
//         threaded=True
//     )