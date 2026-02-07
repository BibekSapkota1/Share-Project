import React from 'react';
import { TrendingUp } from 'lucide-react';

// This is a placeholder component for Holdings functionality
// You can expand this based on your requirements
export default function Holdings({ holdingsData }) {
  return (
    <div className="holdings-page">
      <div className="holdings-header">
        <h2 className="page-title">
          <TrendingUp size={32} />
          My Holdings
        </h2>
      </div>

      <div className="holdings-container">
        {holdingsData && holdingsData.length > 0 ? (
          <div className="holdings-grid">
            {holdingsData.map((holding, index) => (
              <div key={index} className="holding-card">
                <div className="holding-header">
                  <h3>{holding.symbol}</h3>
                  <span className={`pnl ${holding.pnl >= 0 ? 'profit' : 'loss'}`}>
                    {holding.pnl >= 0 ? '+' : ''}{holding.pnl.toFixed(2)}%
                  </span>
                </div>
                <div className="holding-details">
                  <div className="detail-row">
                    <span>Quantity:</span>
                    <strong>{holding.quantity}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Avg Price:</span>
                    <strong>NPR {holding.avgPrice.toFixed(2)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Current Price:</span>
                    <strong>NPR {holding.currentPrice.toFixed(2)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Total Value:</span>
                    <strong>NPR {holding.totalValue.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <TrendingUp size={64} />
            <h3>No Holdings Yet</h3>
            <p>Start trading from the Scanner to build your portfolio</p>
          </div>
        )}
      </div>

      <style>{`
        .holdings-page {
          padding: 1rem 0;
        }

        .holdings-header {
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

        .holdings-container {
          min-height: 400px;
        }

        .holdings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .holding-card {
          background: rgba(15, 20, 25, 0.8);
          border: 1px solid #1e293b;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .holding-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .holding-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #1e293b;
        }

        .holding-header h3 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #f1f5f9;
        }

        .pnl {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .pnl.profit {
          color: #10b981;
        }

        .pnl.loss {
          color: #ef4444;
        }

        .holding-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
        }

        .detail-row span {
          color: #94a3b8;
        }

        .detail-row strong {
          color: #f1f5f9;
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