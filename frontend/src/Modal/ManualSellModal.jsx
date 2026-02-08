import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function ManualSellModal({ sellModalData, onClose, fetchScanner }) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleManualSell = async () => {
    // Validate reason
    if (!reason.trim()) {
      setError('Please provide a reason for selling');
      return;
    }

    if (reason.trim().length < 5) {
      setError('Reason must be at least 5 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setIsSubmitting(false);
        return;
      }

      // Call the manual-sell endpoint directly
      const response = await fetch('http://localhost:8080/api/trade/manual-sell', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          symbol: sellModalData.symbol,
          date: sellModalData.date,
          price: sellModalData.current_price,
          rsi: sellModalData.current_rsi,
          reason: reason.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute manual sell');
      }
      
      onClose(); // Close modal
      
      // Refresh scanner data
      if (fetchScanner) {
        fetchScanner();
      }
      
    } catch (err) {
      console.error('Manual sell error:', err);
      setError(err.message || 'Failed to execute manual sell');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose, isSubmitting]);

  if (!sellModalData) return null;

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target.className === 'modal-overlay' && !isSubmitting) {
        onClose();
      }
    }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Manual Sell - {sellModalData.symbol}</h2>
          <button 
            className="modal-close" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Current Position Info */}
          {sellModalData.open_cycle && (
            <div className="position-info">
              <h3>Current Position</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Cycle #</span>
                  <span className="info-value">{sellModalData.open_cycle.cycle_number}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Buy Price</span>
                  <span className="info-value">NPR {sellModalData.open_cycle.buy_price.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Current Price</span>
                  <span className="info-value">NPR {sellModalData.current_price.toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Unrealized P/L</span>
                  <span className={`info-value ${sellModalData.open_cycle.unrealized_pnl >= 0 ? 'profit' : 'loss'}`}>
                    {sellModalData.open_cycle.unrealized_pnl.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Reason Input */}
          <div className="reason-section">
            <label htmlFor="sell-reason" className="reason-label">
              Reason for Manual Sell <span className="required">*</span>
            </label>
            <textarea
              id="sell-reason"
              className="reason-input"
              placeholder="E.g., Portfolio rebalancing, Risk management, Better opportunity elsewhere..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
            <div className="char-count">
              {reason.length} characters (minimum 5 required)
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Warning */}
          <div className="warning-box">
            <AlertCircle size={20} />
            <div>
              <strong>Important:</strong> Manual selling will close this cycle immediately.
              This action cannot be undone. The reason will be recorded for audit purposes.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            className="btn-cancel" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            className="btn-confirm" 
            onClick={handleManualSell}
            disabled={isSubmitting || !reason.trim() || reason.trim().length < 5}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Manual Sell'}
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
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #334155;
        }

        .modal-title {
          font-size: 1.5rem;
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
        }

        .modal-close:hover:not(:disabled) {
          background: rgba(148, 163, 184, 0.1);
          color: #f1f5f9;
        }

        .modal-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .position-info {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          padding: 1.25rem;
        }

        .position-info h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #3b82f6;
          margin: 0 0 1rem 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-label {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .info-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: #f1f5f9;
        }

        .info-value.profit {
          color: #10b981;
        }

        .info-value.loss {
          color: #ef4444;
        }

        .reason-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .reason-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #f1f5f9;
        }

        .required {
          color: #ef4444;
        }

        .reason-input {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid #334155;
          border-radius: 8px;
          padding: 0.75rem;
          color: #f1f5f9;
          font-size: 0.875rem;
          font-family: inherit;
          resize: vertical;
          min-height: 100px;
        }

        .reason-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .reason-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .char-count {
          font-size: 0.75rem;
          color: #64748b;
          text-align: right;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #ef4444;
          font-size: 0.875rem;
        }

        .warning-box {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          color: #fbbf24;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .warning-box strong {
          color: #f59e0b;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #334155;
        }

        .btn-cancel,
        .btn-confirm {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }

        .btn-cancel {
          background: rgba(100, 116, 139, 0.2);
          color: #94a3b8;
          border: 1px solid #475569;
        }

        .btn-cancel:hover:not(:disabled) {
          background: rgba(100, 116, 139, 0.3);
          color: #f1f5f9;
        }

        .btn-cancel:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-confirm {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }

        .btn-confirm:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .btn-confirm:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 640px) {
          .info-grid {
            grid-template-columns: 1fr;
          }

          .modal-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}