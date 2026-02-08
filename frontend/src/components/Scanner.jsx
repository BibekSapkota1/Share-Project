import React, { useState } from 'react';
import { Search } from 'lucide-react';
import ManualSellModal from '../Modal/ManualSellModal';

export default function Scanner({ 
  scannerData, 
  scannerSummary, 
  scannerLoading, 
  fetchScanner, 
  executeTrade,
  onViewDetails 
}) {
  const [filterSignal, setFilterSignal] = useState('ALL');
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellModalData, setSellModalData] = useState(null);

  const filteredScannerData = scannerData.filter(item => {
    if (filterSignal === 'ALL') return true;
    if (filterSignal === 'HOLDINGS') return item.has_open_cycle;
    if (filterSignal === 'BUY') return item.signal === 'BUY' && !item.has_open_cycle;
    if (filterSignal === 'SELL') return item.signal === 'SELL';
    if (filterSignal === 'NEUTRAL') return item.signal === 'NEUTRAL' || item.signal === 'HOLD';
    return true;
  });

  const openManualSellModal = (item) => {
    console.log('Opening modal with item:', item); // Debug
    setSellModalData(item);
    setShowSellModal(true);
  };

  const closeManualSellModal = () => {
    setShowSellModal(false);
    setSellModalData(null);
  };

  return (
    <div className="scanner-page">
      {showSellModal && sellModalData && (
        <ManualSellModal 
          sellModalData={sellModalData}
          onClose={closeManualSellModal}
          fetchScanner={fetchScanner}
        />
      )}

      <div className="scanner-header">
        <div className="scanner-title-section">
          <h2 className="page-title">
            <Search size={32} />
            Market Scanner
          </h2>
          <p className="page-subtitle">Real-time signals (BUY if top 15 turnover, SELL if you have position)</p>
        </div>
        <button className="refresh-btn" onClick={fetchScanner} disabled={scannerLoading}>
          {scannerLoading ? 'Scanning...' : 'Refresh Scanner'}
        </button>
      </div>

      {scannerSummary && (
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <div className="summary-value">{scannerSummary.total_symbols}</div>
              <div className="summary-label">Total</div>
            </div>
          </div>
          <div className="summary-card buy">
            <div className="summary-icon">🔼</div>
            <div className="summary-content">
              <div className="summary-value">{scannerSummary.buy_signals}</div>
              <div className="summary-label">Buy</div>
            </div>
          </div>
          <div className="summary-card sell">
            <div className="summary-icon">🔽</div>
            <div className="summary-content">
              <div className="summary-value">{scannerSummary.sell_signals}</div>
              <div className="summary-label">Sell</div>
            </div>
          </div>
          <div className="summary-card neutral">
            <div className="summary-icon">➖</div>
            <div className="summary-content">
              <div className="summary-value">{scannerSummary.neutral_signals}</div>
              <div className="summary-label">Neutral</div>
            </div>
          </div>
          <div className="summary-card active">
            <div className="summary-icon">📈</div>
            <div className="summary-content">
              <div className="summary-value">{scannerSummary.open_positions}</div>
              <div className="summary-label">Holdings</div>
            </div>
          </div>
        </div>
      )}

      <div className="scanner-filters">
        <button 
          className={`filter-btn ${filterSignal === 'ALL' ? 'active' : ''}`} 
          onClick={() => setFilterSignal('ALL')}
        >
          All ({scannerData.length})
        </button>
        <button 
          className={`filter-btn holdings ${filterSignal === 'HOLDINGS' ? 'active' : ''}`} 
          onClick={() => setFilterSignal('HOLDINGS')}
        >
          Holdings ({scannerData.filter(s => s.has_open_cycle).length})
        </button>
        <button 
          className={`filter-btn buy ${filterSignal === 'BUY' ? 'active' : ''}`} 
          onClick={() => setFilterSignal('BUY')}
        >
          Buy ({scannerData.filter(s => s.signal === 'BUY' && !s.has_open_cycle).length})
        </button>
        <button 
          className={`filter-btn sell ${filterSignal === 'SELL' ? 'active' : ''}`} 
          onClick={() => setFilterSignal('SELL')}
        >
          Sell ({scannerData.filter(s => s.signal === 'SELL').length})
        </button>
        <button 
          className={`filter-btn neutral ${filterSignal === 'NEUTRAL' ? 'active' : ''}`} 
          onClick={() => setFilterSignal('NEUTRAL')}
        >
          Neutral ({scannerData.filter(s => s.signal === 'NEUTRAL' || s.signal === 'HOLD').length})
        </button>
      </div>

      <div className="scanner-grid">
        {filteredScannerData.map((item, index) => (
          <div key={index} className={`scanner-card ${item.signal_class}`}>
            <div className="scanner-card-header">
              <div className="symbol-name">{item.symbol}</div>
              <div className={`signal-badge ${item.signal_class}`}>{item.signal}</div>
            </div>

            <div className="scanner-card-body">
              <div className="price-section">
                <div className="price-label">Price</div>
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
                  <div className="cycle-row">
                    <span>Buy Price:</span>
                    <strong>NPR {item.open_cycle.buy_price.toFixed(2)}</strong>
                  </div>
                  <div className="cycle-row">
                    <span>Highest:</span>
                    <strong>NPR {item.open_cycle.highest_price.toFixed(2)}</strong>
                  </div>
                  <div className="cycle-row">
                    <span>TSL (5%):</span>
                    <strong>NPR {item.open_cycle.tsl_price.toFixed(2)}</strong>
                  </div>
                  <div className="cycle-row">
                    <span>Unrealized P/L:</span>
                    <strong className={item.open_cycle.unrealized_pnl >= 0 ? 'profit' : 'loss'}>
                      {item.open_cycle.unrealized_pnl.toFixed(2)}%
                    </strong>
                  </div>
                </div>
              </div>
            )}

            <div className="scanner-card-footer">
              <button className="detail-btn" onClick={() => onViewDetails(item.symbol)}>
                View Details
              </button>
              
              {!item.has_open_cycle && item.signal === 'BUY' && (
                <button 
                  className="trade-btn buy" 
                  onClick={() => executeTrade(item.symbol, 'BUY', item.date, item.current_price, item.current_rsi)}
                >
                  Execute Buy
                </button>
              )}
              
              {item.has_open_cycle && item.signal === 'SELL' && (
                <button 
                  className="trade-btn sell" 
                  onClick={() => executeTrade(item.symbol, 'SELL', item.date, item.current_price, item.current_rsi)}
                >
                  Auto Sell
                </button>
              )}
              
              {item.has_open_cycle && (
                <button 
                  className="trade-btn manual-sell" 
                  onClick={() => openManualSellModal(item)}
                >
                  Manual Sell
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredScannerData.length === 0 && (
        <div className="empty-state">
          <Search size={64} />
          <h3>No symbols found</h3>
          <p>Try changing the filter</p>
        </div>
      )}

      <style>{`
        .scanner-page {
          padding: 1rem 0;
        }

        .scanner-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .scanner-title-section {
          flex: 1;
        }

        .page-title {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 2.5rem;
          font-weight: 900;
          color: #f1f5f9;
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: #94a3b8;
          font-size: 1.1rem;
        }

        .refresh-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .refresh-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-content {
          display: flex;
          flex-direction: column;
        }

        .scanner-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .scanner-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .scanner-card {
          background: rgba(15, 20, 25, 0.8);
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .scanner-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .scanner-card.buy {
          border-left: 3px solid #10b981;
        }

        .scanner-card.sell {
          border-left: 3px solid #ef4444;
        }

        .scanner-card.neutral {
          border-left: 3px solid #64748b;
        }

        .scanner-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .symbol-name {
          font-size: 1.5rem;
          font-weight: 800;
          color: #f1f5f9;
        }

        .signal-badge {
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .signal-badge.buy {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .signal-badge.sell {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .signal-badge.neutral {
          background: rgba(100, 116, 139, 0.2);
          color: #94a3b8;
        }

        .scanner-card-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .price-section, .rsi-section {
          text-align: center;
        }

        .price-label, .rsi-label {
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .price-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f1f5f9;
        }

        .rsi-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .rsi-value.buy {
          color: #10b981;
        }

        .rsi-value.sell {
          color: #ef4444;
        }

        .rsi-value.neutral {
          color: #94a3b8;
        }

        .open-cycle-info {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .cycle-badge {
          font-size: 0.85rem;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 0.75rem;
        }

        .cycle-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .cycle-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .cycle-row span {
          color: #94a3b8;
        }

        .cycle-row strong {
          color: #f1f5f9;
        }

        .cycle-row strong.profit {
          color: #10b981;
        }

        .cycle-row strong.loss {
          color: #ef4444;
        }

        .scanner-card-footer {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .detail-btn, .trade-btn {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s ease;
          min-width: 100px;
        }

        .detail-btn {
          background: rgba(30, 41, 59, 0.5);
          color: #94a3b8;
          border: 1px solid #1e293b;
        }

        .detail-btn:hover {
          background: rgba(30, 41, 59, 0.8);
          color: #f1f5f9;
        }

        .trade-btn.buy {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .trade-btn.sell {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .trade-btn.manual-sell {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }

        .trade-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
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

        .filter-btn {
          padding: 0.75rem 1.25rem;
          border: 1px solid #334155;
          background: rgba(30, 41, 59, 0.5);
          color: #94a3b8;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background: rgba(30, 41, 59, 0.8);
          color: #f1f5f9;
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border-color: #3b82f6;
        }

        .filter-btn.buy.active {
          background: linear-gradient(135deg, #10b981, #059669);
          border-color: #10b981;
        }

        .filter-btn.sell.active {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-color: #ef4444;
        }

        .filter-btn.holdings.active {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          border-color: #8b5cf6;
        }

        .filter-btn.neutral.active {
          background: linear-gradient(135deg, #64748b, #475569);
          border-color: #64748b;
        }

        .summary-card {
          background: rgba(15, 20, 25, 0.8);
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .summary-icon {
          font-size: 2rem;
        }

        .summary-value {
          font-size: 2rem;
          font-weight: 800;
          color: #f1f5f9;
        }

        .summary-label {
          font-size: 0.875rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .summary-card.buy {
          border-left: 3px solid #10b981;
        }

        .summary-card.sell {
          border-left: 3px solid #ef4444;
        }

        .summary-card.neutral {
          border-left: 3px solid #64748b;
        }

        .summary-card.active {
          border-left: 3px solid #8b5cf6;
        }
      `}</style>
    </div>
  );
}

// import React, { useState } from 'react';
// import { Search } from 'lucide-react';
// import ManualSellModal from './ManualSellModal';

// export default function Scanner({ 
//   scannerData, 
//   scannerSummary, 
//   scannerLoading, 
//   fetchScanner, 
//   executeTrade,
//   onViewDetails 
// }) {
//   const [filterSignal, setFilterSignal] = useState('ALL');
//   const [showSellModal, setShowSellModal] = useState(false);
//   const [sellModalData, setSellModalData] = useState(null);

//   const filteredScannerData = scannerData.filter(item => {
//     if (filterSignal === 'ALL') return true;
//     if (filterSignal === 'HOLDINGS') return item.has_open_cycle;
//     if (filterSignal === 'BUY') return item.signal === 'BUY' && !item.has_open_cycle;
//     if (filterSignal === 'SELL') return item.signal === 'SELL';
//     if (filterSignal === 'NEUTRAL') return item.signal === 'NEUTRAL' || item.signal === 'HOLD';
//     return true;
//   });

//   const openManualSellModal = (item) => {
//     if (scannerLoading) return; // Prevent opening modal while scanning
//     console.log('Opening modal with item:', item);
//     setSellModalData(item);
//     setShowSellModal(true);
//   };

//   const closeManualSellModal = () => {
//     setShowSellModal(false);
//     setSellModalData(null);
//   };

//   return (
//     <div className="scanner-page">
//       {showSellModal && sellModalData && (
//         <ManualSellModal 
//           sellModalData={sellModalData}
//           onClose={closeManualSellModal}
//           fetchScanner={fetchScanner}
//         />
//       )}

//       <div className="scanner-header">
//         <div className="scanner-title-section">
//           <h2 className="page-title">
//             <Search size={32} />
//             Market Scanner
//           </h2>
//           <p className="page-subtitle">Real-time signals (BUY if top 15 turnover, SELL if you have position)</p>
//         </div>
//         <button className="refresh-btn" onClick={fetchScanner} disabled={scannerLoading}>
//           {scannerLoading ? 'Scanning...' : 'Refresh Scanner'}
//         </button>
//       </div>

//       {scannerSummary && (
//         <div className="summary-cards">
//           <div className="summary-card">
//             <div className="summary-icon">📊</div>
//             <div className="summary-content">
//               <div className="summary-value">{scannerSummary.total_symbols}</div>
//               <div className="summary-label">Total</div>
//             </div>
//           </div>
//           <div className="summary-card buy">
//             <div className="summary-icon">🔼</div>
//             <div className="summary-content">
//               <div className="summary-value">{scannerSummary.buy_signals}</div>
//               <div className="summary-label">Buy</div>
//             </div>
//           </div>
//           <div className="summary-card sell">
//             <div className="summary-icon">🔽</div>
//             <div className="summary-content">
//               <div className="summary-value">{scannerSummary.sell_signals}</div>
//               <div className="summary-label">Sell</div>
//             </div>
//           </div>
//           <div className="summary-card neutral">
//             <div className="summary-icon">➖</div>
//             <div className="summary-content">
//               <div className="summary-value">{scannerSummary.neutral_signals}</div>
//               <div className="summary-label">Neutral</div>
//             </div>
//           </div>
//           <div className="summary-card active">
//             <div className="summary-icon">📈</div>
//             <div className="summary-content">
//               <div className="summary-value">{scannerSummary.open_positions}</div>
//               <div className="summary-label">Holdings</div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="scanner-filters">
//         <button 
//           className={`filter-btn ${filterSignal === 'ALL' ? 'active' : ''}`} 
//           onClick={() => setFilterSignal('ALL')}
//         >
//           All ({scannerData.length})
//         </button>
//         <button 
//           className={`filter-btn holdings ${filterSignal === 'HOLDINGS' ? 'active' : ''}`} 
//           onClick={() => setFilterSignal('HOLDINGS')}
//         >
//           Holdings ({scannerData.filter(s => s.has_open_cycle).length})
//         </button>
//         <button 
//           className={`filter-btn buy ${filterSignal === 'BUY' ? 'active' : ''}`} 
//           onClick={() => setFilterSignal('BUY')}
//         >
//           Buy ({scannerData.filter(s => s.signal === 'BUY' && !s.has_open_cycle).length})
//         </button>
//         <button 
//           className={`filter-btn sell ${filterSignal === 'SELL' ? 'active' : ''}`} 
//           onClick={() => setFilterSignal('SELL')}
//         >
//           Sell ({scannerData.filter(s => s.signal === 'SELL').length})
//         </button>
//         <button 
//           className={`filter-btn neutral ${filterSignal === 'NEUTRAL' ? 'active' : ''}`} 
//           onClick={() => setFilterSignal('NEUTRAL')}
//         >
//           Neutral ({scannerData.filter(s => s.signal === 'NEUTRAL' || s.signal === 'HOLD').length})
//         </button>
//       </div>

//       <div className="scanner-grid">
//         {filteredScannerData.map((item, index) => (
//           <div key={index} className={`scanner-card ${item.signal_class} ${scannerLoading ? 'loading' : ''}`}>
//             <div className="scanner-card-header">
//               <div className="symbol-name">{item.symbol}</div>
//               <div className={`signal-badge ${item.signal_class}`}>{item.signal}</div>
//             </div>

//             <div className="scanner-card-body">
//               <div className="price-section">
//                 <div className="price-label">Price</div>
//                 <div className="price-value">NPR {item.current_price.toFixed(2)}</div>
//               </div>
//               <div className="rsi-section">
//                 <div className="rsi-label">RSI</div>
//                 <div className={`rsi-value ${item.signal_class}`}>{item.current_rsi}</div>
//               </div>
//             </div>

//             {item.has_open_cycle && item.open_cycle && (
//               <div className="open-cycle-info">
//                 <div className="cycle-badge">📍 Cycle #{item.open_cycle.cycle_number} Open</div>
//                 <div className="cycle-details">
//                   <div className="cycle-row">
//                     <span>Buy Price:</span>
//                     <strong>NPR {item.open_cycle.buy_price.toFixed(2)}</strong>
//                   </div>
//                   <div className="cycle-row">
//                     <span>Highest:</span>
//                     <strong>NPR {item.open_cycle.highest_price.toFixed(2)}</strong>
//                   </div>
//                   <div className="cycle-row">
//                     <span>TSL (5%):</span>
//                     <strong>NPR {item.open_cycle.tsl_price.toFixed(2)}</strong>
//                   </div>
//                   <div className="cycle-row">
//                     <span>Unrealized P/L:</span>
//                     <strong className={item.open_cycle.unrealized_pnl >= 0 ? 'profit' : 'loss'}>
//                       {item.open_cycle.unrealized_pnl.toFixed(2)}%
//                     </strong>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="scanner-card-footer">
//               <button 
//                 className="detail-btn" 
//                 onClick={() => onViewDetails(item.symbol)}
//                 disabled={scannerLoading}
//               >
//                 View Details
//               </button>
              
//               {!item.has_open_cycle && item.signal === 'BUY' && (
//                 <button 
//                   className="trade-btn buy" 
//                   onClick={() => executeTrade(item.symbol, 'BUY', item.date, item.current_price, item.current_rsi)}
//                   disabled={scannerLoading}
//                 >
//                   Execute Buy
//                 </button>
//               )}
              
//               {item.has_open_cycle && item.signal === 'SELL' && (
//                 <button 
//                   className="trade-btn sell" 
//                   onClick={() => executeTrade(item.symbol, 'SELL', item.date, item.current_price, item.current_rsi)}
//                   disabled={scannerLoading}
//                 >
//                   Auto Sell
//                 </button>
//               )}
              
//               {item.has_open_cycle && (
//                 <button 
//                   className="trade-btn manual-sell" 
//                   onClick={() => openManualSellModal(item)}
//                   disabled={scannerLoading}
//                 >
//                   Manual Sell
//                 </button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {filteredScannerData.length === 0 && (
//         <div className="empty-state">
//           <Search size={64} />
//           <h3>No symbols found</h3>
//           <p>Try changing the filter</p>
//         </div>
//       )}

//       <style>{`
//         .scanner-page {
//           padding: 1rem 0;
//         }

//         .scanner-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: flex-start;
//           margin-bottom: 2rem;
//         }

//         .scanner-title-section {
//           flex: 1;
//         }

//         .page-title {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//           font-size: 2.5rem;
//           font-weight: 900;
//           color: #f1f5f9;
//           margin-bottom: 0.5rem;
//         }

//         .page-subtitle {
//           color: #94a3b8;
//           font-size: 1.1rem;
//         }

//         .refresh-btn {
//           background: linear-gradient(135deg, #10b981, #059669);
//           color: white;
//           border: none;
//           padding: 0.75rem 1.5rem;
//           border-radius: 8px;
//           font-weight: 600;
//           cursor: pointer;
//           font-family: inherit;
//           transition: all 0.3s ease;
//         }

//         .refresh-btn:hover:not(:disabled) {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
//         }

//         .refresh-btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .summary-cards {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//           gap: 1.5rem;
//           margin-bottom: 2rem;
//         }

//         .summary-content {
//           display: flex;
//           flex-direction: column;
//         }

//         .scanner-filters {
//           display: flex;
//           gap: 1rem;
//           margin-bottom: 2rem;
//           flex-wrap: wrap;
//         }

//         .scanner-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
//           gap: 1.5rem;
//         }

//         .scanner-card {
//           background: rgba(15, 20, 25, 0.8);
//           border: 1px solid #1e293b;
//           border-radius: 12px;
//           padding: 1.5rem;
//           transition: all 0.3s ease;
//         }

//         .scanner-card:hover:not(.loading) {
//           transform: translateY(-4px);
//           box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
//         }

//         .scanner-card.loading {
//           opacity: 0.6;
//         }

//         .scanner-card.buy {
//           border-left: 3px solid #10b981;
//         }

//         .scanner-card.sell {
//           border-left: 3px solid #ef4444;
//         }

//         .scanner-card.neutral {
//           border-left: 3px solid #64748b;
//         }

//         .scanner-card-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 1rem;
//         }

//         .symbol-name {
//           font-size: 1.5rem;
//           font-weight: 800;
//           color: #f1f5f9;
//         }

//         .signal-badge {
//           padding: 0.4rem 0.8rem;
//           border-radius: 6px;
//           font-size: 0.75rem;
//           font-weight: 700;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//         }

//         .signal-badge.buy {
//           background: rgba(16, 185, 129, 0.2);
//           color: #10b981;
//         }

//         .signal-badge.sell {
//           background: rgba(239, 68, 68, 0.2);
//           color: #ef4444;
//         }

//         .signal-badge.neutral {
//           background: rgba(100, 116, 139, 0.2);
//           color: #94a3b8;
//         }

//         .scanner-card-body {
//           display: grid;
//           grid-template-columns: 1fr 1fr;
//           gap: 1rem;
//           margin-bottom: 1rem;
//         }

//         .price-section, .rsi-section {
//           text-align: center;
//         }

//         .price-label, .rsi-label {
//           font-size: 0.8rem;
//           color: #64748b;
//           margin-bottom: 0.5rem;
//         }

//         .price-value {
//           font-size: 1.5rem;
//           font-weight: 700;
//           color: #f1f5f9;
//         }

//         .rsi-value {
//           font-size: 1.5rem;
//           font-weight: 700;
//         }

//         .rsi-value.buy {
//           color: #10b981;
//         }

//         .rsi-value.sell {
//           color: #ef4444;
//         }

//         .rsi-value.neutral {
//           color: #94a3b8;
//         }

//         .open-cycle-info {
//           background: rgba(59, 130, 246, 0.1);
//           border: 1px solid rgba(59, 130, 246, 0.3);
//           border-radius: 8px;
//           padding: 1rem;
//           margin-bottom: 1rem;
//         }

//         .cycle-badge {
//           font-size: 0.85rem;
//           font-weight: 700;
//           color: #3b82f6;
//           margin-bottom: 0.75rem;
//         }

//         .cycle-details {
//           display: flex;
//           flex-direction: column;
//           gap: 0.5rem;
//         }

//         .cycle-row {
//           display: flex;
//           justify-content: space-between;
//           font-size: 0.875rem;
//         }

//         .cycle-row span {
//           color: #94a3b8;
//         }

//         .cycle-row strong {
//           color: #f1f5f9;
//         }

//         .cycle-row strong.profit {
//           color: #10b981;
//         }

//         .cycle-row strong.loss {
//           color: #ef4444;
//         }

//         .scanner-card-footer {
//           display: flex;
//           gap: 0.75rem;
//           flex-wrap: wrap;
//         }

//         .detail-btn, .trade-btn {
//           flex: 1;
//           padding: 0.75rem;
//           border: none;
//           border-radius: 8px;
//           font-weight: 600;
//           cursor: pointer;
//           font-family: inherit;
//           transition: all 0.3s ease;
//           min-width: 100px;
//         }

//         .detail-btn {
//           background: rgba(30, 41, 59, 0.5);
//           color: #94a3b8;
//           border: 1px solid #1e293b;
//         }

//         .detail-btn:hover:not(:disabled) {
//           background: rgba(30, 41, 59, 0.8);
//           color: #f1f5f9;
//         }

//         .detail-btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//         }

//         .trade-btn.buy {
//           background: linear-gradient(135deg, #10b981, #059669);
//           color: white;
//         }

//         .trade-btn.sell {
//           background: linear-gradient(135deg, #ef4444, #dc2626);
//           color: white;
//         }

//         .trade-btn.manual-sell {
//           background: linear-gradient(135deg, #f59e0b, #d97706);
//           color: white;
//         }

//         .trade-btn:hover:not(:disabled) {
//           transform: translateY(-2px);
//           box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
//         }

//         .trade-btn:disabled {
//           opacity: 0.5;
//           cursor: not-allowed;
//           transform: none;
//         }

//         .empty-state {
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           min-height: 400px;
//           text-align: center;
//         }

//         .empty-state svg {
//           color: #334155;
//           margin-bottom: 1.5rem;
//         }

//         .empty-state h3 {
//           font-size: 1.5rem;
//           color: #cbd5e1;
//           margin-bottom: 0.75rem;
//         }

//         .empty-state p {
//           color: #64748b;
//           max-width: 400px;
//         }

//         .filter-btn {
//           padding: 0.75rem 1.25rem;
//           border: 1px solid #334155;
//           background: rgba(30, 41, 59, 0.5);
//           color: #94a3b8;
//           border-radius: 8px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.2s;
//         }

//         .filter-btn:hover {
//           background: rgba(30, 41, 59, 0.8);
//           color: #f1f5f9;
//         }

//         .filter-btn.active {
//           background: linear-gradient(135deg, #3b82f6, #2563eb);
//           color: white;
//           border-color: #3b82f6;
//         }

//         .filter-btn.buy.active {
//           background: linear-gradient(135deg, #10b981, #059669);
//           border-color: #10b981;
//         }

//         .filter-btn.sell.active {
//           background: linear-gradient(135deg, #ef4444, #dc2626);
//           border-color: #ef4444;
//         }

//         .filter-btn.holdings.active {
//           background: linear-gradient(135deg, #8b5cf6, #7c3aed);
//           border-color: #8b5cf6;
//         }

//         .filter-btn.neutral.active {
//           background: linear-gradient(135deg, #64748b, #475569);
//           border-color: #64748b;
//         }

//         .summary-card {
//           background: rgba(15, 20, 25, 0.8);
//           border: 1px solid #1e293b;
//           border-radius: 12px;
//           padding: 1.5rem;
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//         }

//         .summary-icon {
//           font-size: 2rem;
//         }

//         .summary-value {
//           font-size: 2rem;
//           font-weight: 800;
//           color: #f1f5f9;
//         }

//         .summary-label {
//           font-size: 0.875rem;
//           color: #64748b;
//           text-transform: uppercase;
//           letter-spacing: 0.05em;
//         }

//         .summary-card.buy {
//           border-left: 3px solid #10b981;
//         }

//         .summary-card.sell {
//           border-left: 3px solid #ef4444;
//         }

//         .summary-card.neutral {
//           border-left: 3px solid #64748b;
//         }

//         .summary-card.active {
//           border-left: 3px solid #8b5cf6;
//         }
//       `}</style>
//     </div>
//   );
// }