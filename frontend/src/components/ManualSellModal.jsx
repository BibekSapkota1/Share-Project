// // import React, { useState } from 'react';

// // const ManualSellModal = ({ isOpen, item, onClose, onConfirm }) => {
// //   const [price, setPrice] = useState(item?.current_price || '');

// //   if (!isOpen || !item) return null;

// //   return (
// //     <div className="modal-backdrop">
// //       <div className="modal">
// //         <h2>Manual Sell</h2>

// //         <p>
// //           Symbol: <strong>{item.symbol}</strong>
// //         </p>

// //         <div className="form-group">
// //           <label>Sell Price</label>
// //           <input
// //             type="number"
// //             value={price}
// //             onChange={(e) => setPrice(e.target.value)}
// //           />
// //         </div>

// //         <div className="modal-actions">
// //           <button onClick={onClose}>Cancel</button>
// //           <button
// //             className="confirm"
// //             onClick={() => onConfirm(item, price)}
// //           >
// //             Confirm Sell
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ManualSellModal;

// //       <style>{``}</style>

// import React, { useEffect, useState } from 'react';
// import { AlertTriangle, X } from 'lucide-react';

// function ManualSellModal({ isOpen, item, onClose, onConfirm }) {
//   const [sellReason, setSellReason] = useState('');
//   const [confirmationText, setConfirmationText] = useState('');

//   useEffect(() => {
//     if (item) {
//       setSellReason('');
//       setConfirmationText('');
//     }
//   }, [item]);

//   if (!isOpen || !item) return null;

//   const isLoss = item.open_cycle?.unrealized_pnl < 0;
//   const confirmDisabled = isLoss && confirmationText !== 'SELL';

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div
//         className="modal-content"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* HEADER */}
//         <div className="modal-header">
//           <h3>
//             <AlertTriangle size={22} />
//             Manual Sell Confirmation
//           </h3>

//           <button className="modal-close" onClick={onClose}>
//             <X size={18} />
//           </button>
//         </div>

//         {/* BODY */}
//         <div className="modal-body">
//           {/* SELL INFO */}
//           <div className="sell-info">
//             <div className="sell-info-row">
//               <span>Symbol</span>
//               <strong>{item.symbol}</strong>
//             </div>

//             <div className="sell-info-row">
//               <span>Buy Price</span>
//               <strong>NPR {item.open_cycle.buy_price.toFixed(2)}</strong>
//             </div>

//             <div className="sell-info-row">
//               <span>Current Price</span>
//               <strong>NPR {item.current_price.toFixed(2)}</strong>
//             </div>

//             <div className="sell-info-row">
//               <span>Unrealized P/L</span>
//               <strong
//                 className={
//                   item.open_cycle.unrealized_pnl >= 0 ? 'profit' : 'loss'
//                 }
//               >
//                 {item.open_cycle.unrealized_pnl.toFixed(2)}%
//               </strong>
//             </div>
//           </div>

//           {/* WARNING */}
//           {isLoss && (
//             <div className="warning-box">
//               <AlertTriangle size={18} />
//               You are selling at a loss. Type <strong>SELL</strong> to confirm.
//             </div>
//           )}

//           {/* REASON */}
//           <textarea
//             className="sell-reason-input"
//             placeholder="Reason for manual sell (optional)"
//             value={sellReason}
//             onChange={(e) => setSellReason(e.target.value)}
//           />

//           {/* CONFIRMATION */}
//           {isLoss && (
//             <input
//               className="confirmation-input"
//               placeholder="Type SELL to confirm"
//               value={confirmationText}
//               onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
//             />
//           )}
//         </div>

//         {/* FOOTER */}
//         <div className="modal-footer">
//           <button
//             className="modal-btn cancel"
//             onClick={onClose}
//           >
//             Cancel
//           </button>

//           <button
//             className="modal-btn confirm"
//             disabled={confirmDisabled}
//             onClick={() =>
//               onConfirm(item, {
//                 reason: sellReason,
//                 forced: isLoss
//               })
//             }
//           >
//             Confirm Manual Sell
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ManualSellModal;

import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

function ManualSellModal({ isOpen, item, onClose, onConfirm }) {
  const [sellReason, setSellReason] = useState('');
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (item) {
      setSellReason('');
      setConfirmText('');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const isLoss = item.open_cycle?.unrealized_pnl < 0;
  const confirmDisabled = isLoss && confirmText !== 'SELL';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* HEADER */}
        <div className="modal-header">
          <h3>
            <AlertTriangle size={20} />
            Manual Sell Confirmation
          </h3>

          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="modal-body">
          <div className="sell-info">
            <div className="sell-info-row">
              <span>Symbol</span>
              <strong>{item.symbol}</strong>
            </div>

            <div className="sell-info-row">
              <span>Buy Price</span>
              <strong>NPR {item.open_cycle.buy_price.toFixed(2)}</strong>
            </div>

            <div className="sell-info-row">
              <span>Current Price</span>
              <strong>NPR {item.current_price.toFixed(2)}</strong>
            </div>

            <div className="sell-info-row">
              <span>Unrealized P/L</span>
              <strong
                className={
                  item.open_cycle.unrealized_pnl >= 0 ? 'profit' : 'loss'
                }
              >
                {item.open_cycle.unrealized_pnl.toFixed(2)}%
              </strong>
            </div>
          </div>

          {isLoss && (
            <div className="warning-box">
              <AlertTriangle size={16} />
              Selling at a loss. Type <strong>SELL</strong> to confirm.
            </div>
          )}

          <textarea
            className="sell-reason-input"
            placeholder="Reason for manual sell (optional)"
            value={sellReason}
            onChange={(e) => setSellReason(e.target.value)}
          />

          {isLoss && (
            <input
              className="confirmation-input"
              placeholder="Type SELL to confirm"
              value={confirmText}
              onChange={(e) =>
                setConfirmText(e.target.value.toUpperCase())
              }
            />
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button className="modal-btn cancel" onClick={onClose}>
            Cancel
          </button>

          <button
            className="modal-btn confirm"
            disabled={confirmDisabled}
            onClick={() =>
              onConfirm(item, {
                reason: sellReason,
                forced: isLoss,
              })
            }
          >
            Confirm Manual Sell
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManualSellModal;


<script>{`.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: rgba(15, 20, 25, 0.98);
  border: 1px solid #1e293b;
  border-radius: 20px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #1e293b;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #f1f5f9;
  font-size: 1.4rem;
  font-weight: 700;
}

.modal-header h3 svg {
  color: #f59e0b;
}

.modal-close {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.2);
}

.modal-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sell-info {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 1.5rem;
}

.sell-info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(30, 41, 59, 0.5);
}

.sell-info-row:last-child {
  border-bottom: none;
}

.sell-reason-input,
.confirmation-input {
  width: 100%;
  padding: 1rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid #1e293b;
  border-radius: 10px;
  color: #f1f5f9;
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
}

.sell-reason-input:focus,
.confirmation-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.warning-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  color: #ef4444;
  font-size: 0.9rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #1e293b;
}

.modal-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
}

.modal-btn.cancel {
  background: rgba(30, 41, 59, 0.5);
  color: #94a3b8;
  border: 1px solid #1e293b;
}

.modal-btn.cancel:hover {
  background: rgba(30, 41, 59, 0.8);
  color: #f1f5f9;
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.modal-btn.confirm:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
}

.modal-btn.confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}`}</script>