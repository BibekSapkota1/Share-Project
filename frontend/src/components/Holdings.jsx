// import React from 'react';

// function Holdings({ scannerData }) {
//   // Filter only symbols with open cycles
//   const holdings = scannerData.filter(item => item.has_open_cycle);
  
//   return (
//     <div className="holdings-section">
//       <h3>My Holdings ({holdings.length})</h3>
      
//       {holdings.length > 0 ? (
//         <div className="holdings-grid">
//           {holdings.map((item, index) => (
//             <div key={index} className="holding-card">
//               <div className="holding-header">
//                 <h4>{item.symbol}</h4>
//                 <span className="cycle-badge">
//                   Cycle #{item.open_cycle.cycle_number}
//                 </span>
//               </div>
              
//               <div className="holding-stats">
//                 <div className="stat">
//                   <label>Buy Price:</label>
//                   <value>NPR {item.open_cycle.buy_price.toFixed(2)}</value>
//                 </div>
//                 <div className="stat">
//                   <label>Current:</label>
//                   <value>NPR {item.current_price.toFixed(2)}</value>
//                 </div>
//                 <div className="stat">
//                   <label>Highest:</label>
//                   <value>NPR {item.open_cycle.highest_price.toFixed(2)}</value>
//                 </div>
//                 <div className="stat">
//                   <label>TSL (5%):</label>
//                   <value>NPR {item.open_cycle.tsl_price.toFixed(2)}</value>
//                 </div>
//                 <div className={`stat pnl ${item.open_cycle.unrealized_pnl >= 0 ? 'profit' : 'loss'}`}>
//                   <label>Unrealized P/L:</label>
//                   <value>{item.open_cycle.unrealized_pnl.toFixed(2)}%</value>
//                 </div>
//               </div>
              
//               {item.signal === 'SELL' && (
//                 <button className="sell-btn" onClick={() => executeSell(item)}>
//                   Sell Now
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="empty-holdings">
//           <p>No open positions</p>
//           <p>Start trading from the Scanner tab</p>
//         </div>
//       )}
//     </div>
//   );
// }


// This is just a refrence  //

// export default Holdings;
import React from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * Holdings – shows only symbols that have an open trade cycle.
 * Currently a filtered view of scanner data; can be expanded later
 * with portfolio-level stats, allocation charts, etc.
 */
export default function Holdings({ scannerData }) {
  const holdings = scannerData.filter((item) => item.has_open_cycle && item.open_cycle);

  return (
    <div className="holdings-page">
      <div className="holdings-header">
        <h2 className="page-title">
          <TrendingUp size={32} /> My Holdings
        </h2>
        <p className="page-subtitle">{holdings.length} open position{holdings.length !== 1 ? 's' : ''}</p>
      </div>

      {holdings.length > 0 ? (
        <div className="holdings-grid">
          {holdings.map((item, i) => {
            const pnl = item.open_cycle.unrealized_pnl;
            return (
              <div key={i} className="holding-card">
                <div className="holding-header">
                  <span className="holding-symbol">{item.symbol}</span>
                  <span className={`pnl-badge ${pnl >= 0 ? 'profit' : 'loss'}`}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%
                  </span>
                </div>

                <div className="holding-body">
                  <Row label="Current Price" value={`NPR ${item.current_price.toFixed(2)}`} />
                  <Row label="Buy Price" value={`NPR ${item.open_cycle.buy_price.toFixed(2)}`} />
                  <Row label="Highest Price" value={`NPR ${item.open_cycle.highest_price.toFixed(2)}`} />
                  <Row label="TSL (5%)" value={`NPR ${item.open_cycle.tsl_price.toFixed(2)}`} />
                  <Row label="Cycle" value={`#${item.open_cycle.cycle_number}`} />
                  <Row label="RSI" value={item.current_rsi} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <TrendingUp size={64} />
          <h3>No Open Positions</h3>
          <p>Execute a BUY trade from the Scanner to open a position</p>
        </div>
      )}

      <style>{`
        .holdings-page { padding: 1rem 0; }
        .holdings-header { margin-bottom: 2rem; }
        .page-title { display: flex; align-items: center; gap: 1rem; font-size: 2.5rem; font-weight: 900; color: #f1f5f9; margin-bottom: 0.5rem; }
        .page-subtitle { color: #94a3b8; font-size: 1.1rem; }
        .holdings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .holding-card { background: rgba(15,20,25,0.8); border: 1px solid #1e293b; border-radius: 12px; padding: 1.5rem; transition: all 0.3s ease; }
        .holding-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .holding-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .holding-symbol { font-size: 1.5rem; font-weight: 800; color: #f1f5f9; }
        .pnl-badge { padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.85rem; font-weight: 700; }
        .pnl-badge.profit { background: rgba(16,185,129,0.2); color: #10b981; }
        .pnl-badge.loss { background: rgba(239,68,68,0.2); color: #ef4444; }
        .holding-body { display: flex; flex-direction: column; gap: 0.6rem; }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; text-align: center; }
        .empty-state svg { color: #334155; margin-bottom: 1.5rem; }
        .empty-state h3 { font-size: 1.5rem; color: #cbd5e1; margin-bottom: 0.75rem; }
        .empty-state p { color: #64748b; max-width: 400px; }
      `}</style>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.9rem' }}>
      <span style={{ color:'#94a3b8' }}>{label}</span>
      <strong style={{ color:'#f1f5f9' }}>{value}</strong>
    </div>
  );
}