
// This is just a refrence  //

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

export default function Scanner({ scannerData, scannerSummary, scannerLoading, fetchScanner, executeTrade, onViewDetails }) {
  const [filterSignal, setFilterSignal] = useState('ALL');

  const filteredData = useMemo(() => {
    return scannerData.filter((item) => {
      if (filterSignal === 'ALL') return true;
      if (filterSignal === 'HOLDINGS') return item.has_open_cycle;
      if (filterSignal === 'BUY') return item.signal === 'BUY' && !item.has_open_cycle;
      if (filterSignal === 'SELL') return item.signal === 'SELL';
      if (filterSignal === 'NEUTRAL') return item.signal === 'NEUTRAL' || item.signal === 'HOLD';
      return true;
    });
  }, [scannerData, filterSignal]);

  return (
    <div className="scanner-page">
      {/* Header */}
      <div className="scanner-header">
        <div className="scanner-title-section">
          <h2 className="page-title"><Search size={32} /> Market Scanner</h2>
          <p className="page-subtitle">Real-time signals for all available symbols</p>
        </div>
        <button className="refresh-btn" onClick={fetchScanner} disabled={scannerLoading}>
          {scannerLoading ? 'Scanning...' : 'Refresh Scanner'}
        </button>
      </div>

      {/* Summary Cards */}
      {scannerSummary && (
        <div className="summary-cards">
          <SummaryCard icon="📊" value={scannerSummary.total_symbols} label="Total Symbols" />
          <SummaryCard icon="🔼" value={scannerSummary.buy_signals} label="Buy Signals" variant="buy" />
          <SummaryCard icon="🔽" value={scannerSummary.sell_signals} label="Sell Signals" variant="sell" />
          <SummaryCard icon="➖" value={scannerSummary.neutral_signals} label="Neutral" variant="neutral" />
          <SummaryCard icon="📈" value={scannerSummary.open_positions} label="Open Positions" variant="active" />
        </div>
      )}

      {/* Filters */}
      <div className="scanner-filters">
        <FilterBtn active={filterSignal === 'ALL'} onClick={() => setFilterSignal('ALL')}>
          All ({scannerData.length})
        </FilterBtn>
        <FilterBtn active={filterSignal === 'HOLDINGS'} variant="holdings" onClick={() => setFilterSignal('HOLDINGS')}>
          Holdings ({scannerData.filter((s) => s.has_open_cycle).length})
        </FilterBtn>
        <FilterBtn active={filterSignal === 'BUY'} variant="buy" onClick={() => setFilterSignal('BUY')}>
          Buy ({scannerData.filter((s) => s.signal === 'BUY' && !s.has_open_cycle).length})
        </FilterBtn>
        <FilterBtn active={filterSignal === 'SELL'} variant="sell" onClick={() => setFilterSignal('SELL')}>
          Sell ({scannerData.filter((s) => s.signal === 'SELL').length})
        </FilterBtn>
        <FilterBtn active={filterSignal === 'NEUTRAL'} variant="neutral" onClick={() => setFilterSignal('NEUTRAL')}>
          Neutral ({scannerData.filter((s) => s.signal === 'NEUTRAL' || s.signal === 'HOLD').length})
        </FilterBtn>
      </div>

      {/* Card Grid */}
      <div className="scanner-grid">
        {filteredData.map((item, index) => (
          <div key={index} className={`scanner-card ${item.signal_class}`}>
            <div className="scanner-card-header">
              <div className="symbol-name">{item.symbol}</div>
              <div className={`signal-badge ${item.signal_class}`}>{item.signal}</div>
            </div>

            <div className="scanner-card-body">
              <div className="price-section">
                <div className="price-label">Current Price</div>
                <div className="price-value">NPR {item.current_price.toFixed(2)}</div>
              </div>
              <div className="rsi-section">
                <div className="rsi-label">RSI</div>
                <div className={`rsi-value ${item.signal_class}`}>{item.current_rsi}</div>
              </div>
            </div>

            {item.has_open_cycle && item.open_cycle && (
              <div className="open-cycle-info">
                <div className="cycle-badge">📍 Cycle #{item.open_cycle.cycle_number} Open</div>
                <div className="cycle-details">
                  <CycleRow label="Buy Price:" value={`NPR ${item.open_cycle.buy_price.toFixed(2)}`} />
                  <CycleRow label="Highest:" value={`NPR ${item.open_cycle.highest_price.toFixed(2)}`} />
                  <CycleRow label="TSL (5%):" value={`NPR ${item.open_cycle.tsl_price.toFixed(2)}`} />
                  <CycleRow
                    label="Unrealized P/L:"
                    value={`${item.open_cycle.unrealized_pnl.toFixed(2)}%`}
                    pnl={item.open_cycle.unrealized_pnl}
                  />
                </div>
              </div>
            )}

            <div className="scanner-card-footer">
              <button className="detail-btn" onClick={() => onViewDetails(item.symbol)}>View Details</button>
              {!item.has_open_cycle && item.signal === 'BUY' && (
                <button className="trade-btn buy" onClick={() => executeTrade(item.symbol, 'BUY', item.date, item.current_price, item.current_rsi)}>
                  Execute Buy
                </button>
              )}
              {item.has_open_cycle && item.signal === 'SELL' && (
                <button className="trade-btn sell" onClick={() => executeTrade(item.symbol, 'SELL', item.date, item.current_price, item.current_rsi)}>
                  Execute Sell
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="empty-state">
          <Search size={64} />
          <h3>No symbols found</h3>
          <p>Try changing the filter or refresh the scanner</p>
        </div>
      )}

      <style>{`
        .scanner-page { padding: 1rem 0; }
        .scanner-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        .scanner-title-section { flex: 1; }
        .page-title { display: flex; align-items: center; gap: 1rem; font-size: 2.5rem; font-weight: 900; color: #f1f5f9; margin-bottom: 0.5rem; }
        .page-subtitle { color: #94a3b8; font-size: 1.1rem; }
        .refresh-btn { background: linear-gradient(135deg,#10b981,#059669); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.3s ease; }
        .refresh-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
        .refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .summary-cards { display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .scanner-filters { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
        .scanner-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(320px,1fr)); gap: 1.5rem; }
        .scanner-card { background: rgba(15,20,25,0.8); border: 1px solid #1e293b; border-radius: 12px; padding: 1.5rem; transition: all 0.3s ease; }
        .scanner-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .scanner-card.buy { border-left: 3px solid #10b981; }
        .scanner-card.sell { border-left: 3px solid #ef4444; }
        .scanner-card.neutral { border-left: 3px solid #64748b; }
        .scanner-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .symbol-name { font-size: 1.5rem; font-weight: 800; color: #f1f5f9; }
        .signal-badge { padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .signal-badge.buy { background: rgba(16,185,129,0.2); color: #10b981; }
        .signal-badge.sell { background: rgba(239,68,68,0.2); color: #ef4444; }
        .signal-badge.neutral { background: rgba(100,116,139,0.2); color: #94a3b8; }
        .scanner-card-body { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .price-section, .rsi-section { text-align: center; }
        .price-label, .rsi-label { font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem; }
        .price-value { font-size: 1.5rem; font-weight: 700; color: #f1f5f9; }
        .rsi-value { font-size: 1.5rem; font-weight: 700; }
        .rsi-value.buy { color: #10b981; }
        .rsi-value.sell { color: #ef4444; }
        .rsi-value.neutral { color: #94a3b8; }
        .open-cycle-info { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
        .cycle-badge { font-size: 0.85rem; font-weight: 700; color: #3b82f6; margin-bottom: 0.75rem; }
        .cycle-details { display: flex; flex-direction: column; gap: 0.5rem; }
        .scanner-card-footer { display: flex; gap: 0.75rem; }
        .detail-btn, .trade-btn { flex: 1; padding: 0.75rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.3s ease; }
        .detail-btn { background: rgba(30,41,59,0.5); color: #94a3b8; border: 1px solid #1e293b; }
        .detail-btn:hover { background: rgba(30,41,59,0.8); color: #f1f5f9; }
        .trade-btn.buy { background: linear-gradient(135deg,#10b981,#059669); color: white; }
        .trade-btn.sell { background: linear-gradient(135deg,#ef4444,#dc2626); color: white; }
        .trade-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; }
        .empty-state svg { color: #334155; margin-bottom: 1.5rem; }
        .empty-state h3 { font-size: 1.5rem; color: #cbd5e1; margin-bottom: 0.75rem; }
        .empty-state p { color: #64748b; max-width: 400px; }
      `}</style>
    </div>
  );
}

// ── small reusable sub-components ───────────────────────────────────────────

function SummaryCard({ icon, value, label, variant = '' }) {
  return (
    <div className={`summary-card ${variant}`}>
      <div className="summary-icon">{icon}</div>
      <div className="summary-content">
        <div className="summary-value">{value}</div>
        <div className="summary-label">{label}</div>
      </div>
    </div>
  );
}

function FilterBtn({ active, variant = '', onClick, children }) {
  return (
    <button className={`filter-btn ${variant} ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

function CycleRow({ label, value, pnl }) {
  const valueClass = pnl !== undefined ? (pnl >= 0 ? 'profit' : 'loss') : '';
  return (
    <div className="cycle-row">
      <span>{label}</span>
      <strong className={valueClass}>{value}</strong>
    </div>
  );
}

// Shared mini-styles injected once (summary + filter + cycle-row)