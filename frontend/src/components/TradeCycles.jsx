import React from 'react';
import { History } from 'lucide-react';

export default function TradeCycles({ allCycles, cyclesLoading, fetchCycles }) {
  return (
    <div className="cycles-page">
      <div className="cycles-header">
        <h2 className="page-title">
          <History size={32} />
          Trade Cycles History
        </h2>
        <button 
          className="refresh-btn" 
          onClick={() => fetchCycles()} 
          disabled={cyclesLoading}
        >
          {cyclesLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="cycles-container">
        {allCycles.length > 0 ? (
          <div className="cycles-table-wrapper">
            <table className="cycles-table">
              <thead>
                <tr>
                  <th>Cycle #</th>
                  <th>Symbol</th>
                  <th>Status</th>
                  <th>Buy Date</th>
                  <th>Buy Price</th>
                  <th>Sell Date</th>
                  <th>Sell Price</th>
                  <th>P/L</th>
                  <th>P/L %</th>
                  <th>Sell Reason</th>
                </tr>
              </thead>
              <tbody>
                {allCycles.map((cycle) => (
                  <tr key={cycle.id} className={cycle.status === 'OPEN' ? 'open-cycle' : ''}>
                    <td>#{cycle.cycle_number}</td>
                    <td><strong>{cycle.symbol}</strong></td>
                    <td>
                      <span className={`status-badge ${cycle.status.toLowerCase()}`}>
                        {cycle.status}
                      </span>
                    </td>
                    <td>{cycle.buy_date}</td>
                    <td>NPR {cycle.buy_price.toFixed(2)}</td>
                    <td>{cycle.sell_date || '-'}</td>
                    <td>{cycle.sell_price ? `NPR ${cycle.sell_price.toFixed(2)}` : '-'}</td>
                    <td className={cycle.profit_loss >= 0 ? 'profit' : 'loss'}>
                      {cycle.profit_loss ? `NPR ${cycle.profit_loss.toFixed(2)}` : '-'}
                    </td>
                    <td className={cycle.profit_loss_percent >= 0 ? 'profit' : 'loss'}>
                      {cycle.profit_loss_percent ? `${cycle.profit_loss_percent.toFixed(2)}%` : '-'}
                    </td>
                    <td>
                      {cycle.sell_reason && (
                        <span 
                          className={
                            cycle.sell_reason === 'AUTOMATIC' 
                              ? 'reason-badge automatic' 
                              : 'reason-badge manual'
                          }
                        >
                          {cycle.sell_reason}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <History size={64} />
            <h3>No Trade Cycles</h3>
            <p>Execute trades from the Scanner</p>
          </div>
        )}
      </div>

      <style>{`
        .cycles-page {
          padding: 1rem 0;
        }

        .cycles-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-title {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 2.5rem;
          font-weight: 900;
          color: #f1f5f9;
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

        .cycles-table-wrapper {
          background: rgba(15, 20, 25, 0.8);
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 1.5rem;
          overflow-x: auto;
        }

        .cycles-table {
          width: 100%;
          border-collapse: collapse;
        }

        .cycles-table th {
          background: rgba(30, 41, 59, 0.5);
          padding: 1rem;
          text-align: left;
          font-size: 0.85rem;
          font-weight: 700;
          color: #10b981;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #1e293b;
        }

        .cycles-table td {
          padding: 1rem;
          border-bottom: 1px solid #1e293b;
          font-size: 0.9rem;
          color: #e2e8f0;
        }

        .cycles-table tr:hover {
          background: rgba(30, 41, 59, 0.3);
        }

        .cycles-table tr.open-cycle {
          background: rgba(59, 130, 246, 0.05);
        }

        .status-badge {
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-badge.open {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .status-badge.closed {
          background: rgba(100, 116, 139, 0.2);
          color: #94a3b8;
        }

        .profit {
          color: #10b981;
          font-weight: 700;
        }

        .loss {
          color: #ef4444;
          font-weight: 700;
        }

        .reason-badge {
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .reason-badge.automatic {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .reason-badge.manual {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
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
      `}</style>
    </div>
  );
}