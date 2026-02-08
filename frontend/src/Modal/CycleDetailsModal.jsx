import React, { useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, DollarSign, Activity } from 'lucide-react';

export default function CycleDetailsModal({ cycle, onClose }) {
  // Hide the app header when modal is open
  useEffect(() => {
    const appHeader = document.querySelector('.app-header');
    if (appHeader) {
      appHeader.style.display = 'none';
    }
    
    return () => {
      if (appHeader) {
        appHeader.style.display = 'flex';
      }
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!cycle) return null;

  const isProfitable = cycle.profit_loss >= 0;
  const isOpen = cycle.status === 'OPEN';

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target.className === 'modal-overlay') {
        onClose();
      }
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <h2 className="modal-title">
              {cycle.symbol} - Cycle #{cycle.cycle_number}
            </h2>
            <span className={`status-badge ${cycle.status.toLowerCase()}`}>
              {cycle.status}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Basic Info */}
          <div className="info-section">
            <h3 className="section-title">Basic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Symbol</span>
                <span className="info-value">{cycle.symbol}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Sector</span>
                <span className="info-value">{cycle.sector || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Cycle Number</span>
                <span className="info-value">#{cycle.cycle_number}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status</span>
                <span className={`info-value ${cycle.status.toLowerCase()}`}>
                  {cycle.status}
                </span>
              </div>
            </div>
          </div>

          {/* Buy Information */}
          <div className="info-section buy-section">
            <h3 className="section-title">
              <TrendingUp size={20} />
              Buy Details
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <Calendar size={16} className="info-icon" />
                <div>
                  {/* <span className="info-label">Buy Date</span> */}
                  <span className="info-value">{cycle.buy_date}</span>
                </div>
              </div>
              <div className="info-item">
                <DollarSign size={16} className="info-icon" />
                <div>
                  {/* <span className="info-label">Buy Price</span> */}
                  <span className="info-value">NPR {cycle.buy_price.toFixed(2)}</span>
                </div>
              </div>
              <div className="info-item">
                <Activity size={16} className="info-icon" />
                <div>
                  {/* <span className="info-label">Buy RSI</span> */}
                  <span className="info-value">{cycle.buy_rsi.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sell Information */}
          <div className="info-section sell-section">
            <h3 className="section-title">
              <TrendingDown size={20} />
              Sell Details
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <Calendar size={16} className="info-icon" />
                <div>
                  {/* <span className="info-label">Sell Date</span> */}
                  <span className="info-value">{cycle.sell_date || 'Not Sold Yet'}</span>
                </div>
              </div>
              <div className="info-item">
                <DollarSign size={16} className="info-icon" />
                <div>
                  {/* <span className="info-label">Sell Price</span> */}
                  <span className="info-value">
                    {cycle.sell_price ? `NPR ${cycle.sell_price.toFixed(2)}` : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="info-item">
                <Activity size={16} className="info-icon" />
                <div>
                  {/* <span className="info-label">Sell RSI</span> */}
                  <span className="info-value">
                    {cycle.sell_rsi ? cycle.sell_rsi.toFixed(2) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Tracking */}
          <div className="info-section tracking-section">
            <h3 className="section-title">Price Tracking</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Highest Price After Buy</span>
                <span className="info-value highlight">
                  NPR {cycle.highest_price_after_buy.toFixed(2)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">TSL Trigger Price (5%)</span>
                <span className="info-value">
                  {cycle.tsl_trigger_price 
                    ? `NPR ${cycle.tsl_trigger_price.toFixed(2)}` 
                    : 'Not Set'}
                </span>
              </div>
            </div>
          </div>

          {/* Performance */}
          {!isOpen && (
            <div className={`info-section performance-section ${isProfitable ? 'profit-section' : 'loss-section'}`}>
              <h3 className="section-title">Performance</h3>
              <div className="performance-grid">
                <div className="performance-item">
                  <span className="performance-label">Profit/Loss</span>
                  <span className={`performance-value ${isProfitable ? 'profit' : 'loss'}`}>
                    {cycle.profit_loss 
                      ? `${isProfitable ? '+' : ''}NPR ${cycle.profit_loss.toFixed(2)}` 
                      : 'N/A'}
                  </span>
                </div>
                <div className="performance-item">
                  <span className="performance-label">Profit/Loss %</span>
                  <span className={`performance-value ${isProfitable ? 'profit' : 'loss'}`}>
                    {cycle.profit_loss_percent 
                      ? `${isProfitable ? '+' : ''}${cycle.profit_loss_percent.toFixed(2)}%` 
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sell Reason */}
          {cycle.sell_reason && (
            <div className="info-section reason-section">
              <h3 className="section-title">Sell Reason</h3>
              <div className="reason-content">
                <span className={`reason-badge ${cycle.sell_reason === 'AUTOMATIC' ? 'automatic' : 'manual'}`}>
                  {cycle.sell_reason}
                </span>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="info-section timestamps-section">
            <h3 className="section-title">Timestamps</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Created At</span>
                <span className="info-value small">
                  {new Date(cycle.created_at).toLocaleString()}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Updated At</span>
                <span className="info-value small">
                  {new Date(cycle.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid #334155;
          border-radius: 16px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem;
          border-bottom: 1px solid #334155;
          position: sticky;
          top: 0;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          z-index: 10;
        }

        .header-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .modal-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
        }

        .modal-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .modal-close:hover {
          background: rgba(148, 163, 184, 0.1);
          color: #f1f5f9;
        }

        .modal-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .info-section {
          background: rgba(30, 41, 59, 0.3);
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 1.25rem;
        }

        .buy-section {
          border-left: 3px solid #10b981;
        }

        .sell-section {
          border-left: 3px solid #ef4444;
        }

        .tracking-section {
          border-left: 3px solid #3b82f6;
        }

        .performance-section {
          border-left: 3px solid #8b5cf6;
        }

        .profit-section {
          background: rgba(16, 185, 129, 0.05);
          border-color: #10b981;
        }

        .loss-section {
          background: rgba(239, 68, 68, 0.05);
          border-color: #ef4444;
        }

        .reason-section {
          border-left: 3px solid #f59e0b;
        }

        .timestamps-section {
          border-left: 3px solid #64748b;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0 0 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-item:has(.info-icon) {
          flex-direction: row;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .info-icon {
          color: #64748b;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .info-label {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .info-value {
          font-size: 1rem;
          font-weight: 600;
          color: #f1f5f9;
        }

        .info-value.small {
          font-size: 0.875rem;
        }

        .info-value.highlight {
          color: #3b82f6;
        }

        .info-value.open {
          color: #3b82f6;
        }

        .info-value.closed {
          color: #94a3b8;
        }

        .performance-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .performance-item {
          text-align: center;
          padding: 1rem;
          background: rgba(15, 23, 42, 0.5);
          border-radius: 8px;
        }

        .performance-label {
          display: block;
          font-size: 0.875rem;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }

        .performance-value {
          display: block;
          font-size: 1.75rem;
          font-weight: 800;
        }

        .performance-value.profit {
          color: #10b981;
        }

        .performance-value.loss {
          color: #ef4444;
        }

        .reason-content {
          display: flex;
          justify-content: center;
        }

        .reason-badge {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .reason-badge.automatic {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .reason-badge.manual {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .status-badge {
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-badge.open {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .status-badge.closed {
          background: rgba(100, 116, 139, 0.2);
          color: #94a3b8;
          border: 1px solid rgba(100, 116, 139, 0.3);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          padding: 1.5rem;
          border-top: 1px solid #334155;
          position: sticky;
          bottom: 0;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        }

        .btn-close {
          padding: 0.75rem 1.5rem;
          border: 1px solid #475569;
          background: rgba(100, 116, 139, 0.2);
          color: #94a3b8;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: rgba(100, 116, 139, 0.3);
          color: #f1f5f9;
        }

        @media (max-width: 640px) {
          .info-grid {
            grid-template-columns: 1fr;
          }

          .performance-grid {
            grid-template-columns: 1fr;
          }

          .modal-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}