import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Database, Settings, AlertCircle, Activity, TrendingUp, TrendingDown } from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

export default function Analysis({ 
  symbols, 
  selectedSymbol, 
  setSelectedSymbol, 
  showNotificationMessage,
  onLogout 
}) {
  const [chartData, setChartData] = useState([]);
  const [signals, setSignals] = useState([]);
  const [latestSignal, setLatestSignal] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [upperThreshold, setUpperThreshold] = useState(70);
  const [lowerThreshold, setLowerThreshold] = useState(30);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': localStorage.getItem('token') || ''
  });

  const analyzeData = async () => {
    if (!selectedSymbol) {
      showNotificationMessage('Please select a symbol', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
      } else {
        if (response.status === 401) onLogout();
        showNotificationMessage(data.error, 'error');
      }
    } catch (error) {
      showNotificationMessage('Error analyzing data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSymbol) {
      analyzeData();
    }
  }, [selectedSymbol, rsiPeriod, upperThreshold, lowerThreshold]);

  return (
    <div className="analysis-page">
      <div className="analysis-layout">
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
                  <strong>
                    {statistics.date_range?.start} to {statistics.date_range?.end}
                  </strong>
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
              <label>Upper Threshold (Buy)</label>
              <input 
                type="number" 
                value={upperThreshold} 
                onChange={(e) => setUpperThreshold(parseInt(e.target.value))} 
                min="50" 
                max="100" 
                className="setting-input" 
              />
              <div className="threshold-bar">
                <div className="threshold-fill buy" style={{width: `${upperThreshold}%`}}></div>
              </div>
            </div>

            <div className="setting-group">
              <label>Lower Threshold (Sell)</label>
              <input 
                type="number" 
                value={lowerThreshold} 
                onChange={(e) => setLowerThreshold(parseInt(e.target.value))} 
                min="0" 
                max="50" 
                className="setting-input" 
              />
              <div className="threshold-bar">
                <div className="threshold-fill sell" style={{width: `${lowerThreshold}%`}}></div>
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

        <div className="chart-area">
          {chartData.length > 0 ? (
            <>
              <div className="chart-container">
                <h3 className="chart-title">Price Chart</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" />
                    <XAxis dataKey="date" stroke="#64748b" tick={{fill: '#94a3b8'}} />
                    <YAxis stroke="#64748b" tick={{fill: '#94a3b8'}} />
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
                    <XAxis dataKey="date" stroke="#64748b" tick={{fill: '#94a3b8'}} />
                    <YAxis domain={[0, 100]} stroke="#64748b" tick={{fill: '#94a3b8'}} />
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
                      stroke="#10b981" 
                      strokeDasharray="3 3" 
                      label="Buy Zone" 
                    />
                    <ReferenceLine 
                      y={50} 
                      stroke="#94a3b8" 
                      strokeDasharray="3 3" 
                      label="Neutral" 
                    />
                    <ReferenceLine 
                      y={lowerThreshold} 
                      stroke="#ef4444" 
                      strokeDasharray="3 3" 
                      label="Sell Zone" 
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
                        {signal.type === 'BUY' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                        <div className="signal-details">
                          <div className="signal-header">
                            <strong>{signal.type}</strong>
                            <span className="signal-date">{signal.date}</span>
                          </div>
                          <div className="signal-info">
                            <span>Price: NPR {signal.price.toFixed(2)}</span>
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
              <p>Select a symbol and configure your RSI settings</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .analysis-page {
          padding: 1rem 0;
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
        }

        .signal-alert.overbought {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .signal-alert.oversold {
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
          min-height: 400px;
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

        @media (max-width: 1200px) {
          .analysis-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}