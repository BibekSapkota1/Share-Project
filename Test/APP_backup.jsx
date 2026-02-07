// import ManualSellModal from './components/ManualSellModal';
// import React, { useState, useEffect } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
// import { TrendingUp, TrendingDown, Activity, Settings, Bell, AlertCircle, Database, Search, BarChart3, History, LogOut, User } from 'lucide-react';

// const API_URL = 'http://localhost:8080/api';

// function App() {
//   // Auth state
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);
//   const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [authLoading, setAuthLoading] = useState(false);

//   const [activeTab, setActiveTab] = useState('scanner');
//   const [symbols, setSymbols] = useState([]);
//   const [selectedSymbol, setSelectedSymbol] = useState('');
//   const [chartData, setChartData] = useState([]);
//   const [signals, setSignals] = useState([]);
//   const [latestSignal, setLatestSignal] = useState(null);
//   const [statistics, setStatistics] = useState(null);
//   const [loading, setLoading] = useState(false);
  
//   // Scanner state
//   const [scannerData, setScannerData] = useState([]);
//   const [scannerSummary, setScannerSummary] = useState(null);
//   const [scannerLoading, setScannerLoading] = useState(false);
//   const [filterSignal, setFilterSignal] = useState('ALL'); // ALL, HOLDINGS, BUY, SELL, NEUTRAL
  
//   // Cycles state
//   const [allCycles, setAllCycles] = useState([]);
//   const [cyclesLoading, setCyclesLoading] = useState(false);
  
//   // RSI Settings
//   const [rsiPeriod, setRsiPeriod] = useState(14);
//   const [upperThreshold, setUpperThreshold] = useState(70);
//   const [lowerThreshold, setLowerThreshold] = useState(30);
//   const [showNotification, setShowNotification] = useState(false);
//   const [notification, setNotification] = useState(null);

//   // Check for existing token on mount
//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       verifyToken(token);
//     }
//   }, []);

//   // Fetch data when authenticated
//   useEffect(() => {
//     if (isAuthenticated) {
//       fetchSymbols();
//       fetchScanner();
//     }
//   }, [isAuthenticated]);

// const [showManualSellModal, setShowManualSellModal] = useState(false);
// const [manualSellItem, setManualSellItem] = useState(null);

// const openManualSellModal = (item) => {
//   setManualSellItem(item);
//   setShowManualSellModal(true);
// };

// const closeManualSellModal = () => {
//   setShowManualSellModal(false);
//   setManualSellItem(null);
// };


//   const verifyToken = async (token) => {
//     try {
//       const response = await fetch(`${API_URL}/auth/verify`, {
//         headers: { 'Authorization': token }
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         setUser(data.user);
//         setIsAuthenticated(true);
//       } else {
//         localStorage.removeItem('token');
//       }
//     } catch (error) {
//       console.error('Token verification failed:', error);
//       localStorage.removeItem('token');
//     }
//   };

  

//   const handleAuth = async (e) => {
//     e.preventDefault();
//     setAuthLoading(true);

//     try {
//       const endpoint = authMode === 'login' ? '/auth/login' : '/auth/signup';
//       const response = await fetch(`${API_URL}${endpoint}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         localStorage.setItem('token', data.token);
//         setUser(data.user);
//         setIsAuthenticated(true);
//         setEmail('');
//         setPassword('');
//         showNotificationMessage(`Welcome ${data.user.email}!`, 'success');
//       } else {
//         showNotificationMessage(data.error, 'error');
//       }
//     } catch (error) {
//       showNotificationMessage('Connection error. Please try again.', 'error');
//     } finally {
//       setAuthLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     setIsAuthenticated(false);
//     setUser(null);
//     setScannerData([]);
//     setAllCycles([]);
//     showNotificationMessage('Logged out successfully', 'success');
//   };

//   const getAuthHeaders = () => {
//     const token = localStorage.getItem('token');
//     return {
//       'Content-Type': 'application/json',
//       'Authorization': token || ''
//     };
//   };

//   const fetchSymbols = async () => {
//     try {
//       const response = await fetch(`${API_URL}/symbols`);
//       const data = await response.json();
      
//       if (response.ok) {
//         setSymbols(data.symbols);
//         if (data.symbols.length > 0) {
//           setSelectedSymbol(data.symbols[0]);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching symbols:', error);
//     }
//   };

//   const fetchScanner = async () => {
//     setScannerLoading(true);
//     try {
//       const response = await fetch(`${API_URL}/scanner`, {
//         headers: getAuthHeaders()
//       });
//       const data = await response.json();
      
//       if (response.ok) {
//         setScannerData(data.symbols);
//         setScannerSummary(data.summary);
//       } else {
//         if (response.status === 401) {
//           handleLogout();
//         }
//         showNotificationMessage(data.error, 'error');
//       }
//     } catch (error) {
//       showNotificationMessage('Error fetching scanner data', 'error');
//     } finally {
//       setScannerLoading(false);
//     }
//   };

//   const fetchCycles = async (symbol = null) => {
//     setCyclesLoading(true);
//     try {
//       const url = symbol ? `${API_URL}/cycles/${symbol}` : `${API_URL}/cycles`;
//       const response = await fetch(url, {
//         headers: getAuthHeaders()
//       });
//       const data = await response.json();
      
//       if (response.ok) {
//         setAllCycles(data.cycles);
//       } else {
//         if (response.status === 401) {
//           handleLogout();
//         }
//         showNotificationMessage(data.error, 'error');
//       }
//     } catch (error) {
//       showNotificationMessage('Error fetching cycles', 'error');
//     } finally {
//       setCyclesLoading(false);
//     }
//   };

//   const executeTrade = async (symbol, action, date, price, rsi) => {
//     try {
//       const response = await fetch(`${API_URL}/trade`, {
//         method: 'POST',
//         headers: getAuthHeaders(),
//         body: JSON.stringify({ symbol, action, date, price, rsi })
//       });
      
//       const data = await response.json();
      
//       if (response.ok) {
//         showNotificationMessage(data.message, 'success');
//         fetchScanner();
//         if (activeTab === 'cycles') {
//           fetchCycles();
//         }
//       } else {
//         if (response.status === 401) {
//           handleLogout();
//         }
//         showNotificationMessage(data.error, 'error');
//       }
//     } catch (error) {
//       showNotificationMessage('Error executing trade', 'error');
//     }
//   };

//   const confirmManualSell = (item, meta) => {
//     executeTrade(
//       item.symbol,
//       'SELL',
//       item.date,
//       item.current_price,
//       item.current_rsi
//     );
  
//     closeManualSellModal();
//   };
  
  

//   const analyzeData = async () => {
//     if (!selectedSymbol) {
//       showNotificationMessage('Please select a symbol', 'error');
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       const response = await fetch(`${API_URL}/analyze`, {
//         method: 'POST',
//         headers: getAuthHeaders(),
//         body: JSON.stringify({
//           symbol: selectedSymbol,
//           rsi_period: rsiPeriod,
//           upper_threshold: upperThreshold,
//           lower_threshold: lowerThreshold
//         })
//       });
      
//       const data = await response.json();
//       if (response.ok) {
//         setChartData(data.chart_data);
//         setSignals(data.signals);
//         setLatestSignal(data.latest_signal);
//         setStatistics(data.statistics);
//       } else {
//         if (response.status === 401) {
//           handleLogout();
//         }
//         showNotificationMessage(data.error, 'error');
//       }
//     } catch (error) {
//       showNotificationMessage('Error analyzing data', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showNotificationMessage = (message, type) => {
//     setNotification({ message, type });
//     setShowNotification(true);
//     setTimeout(() => setShowNotification(false), 5000);
//   };

//   useEffect(() => {
//     if (selectedSymbol && activeTab === 'analysis' && isAuthenticated) {
//       analyzeData();
//     }
//   }, [selectedSymbol, rsiPeriod, upperThreshold, lowerThreshold]);

//   useEffect(() => {
//     if (activeTab === 'cycles' && isAuthenticated) {
//       fetchCycles();
//     }
//   }, [activeTab]);

//   const filteredScannerData = scannerData.filter(item => {
//     if (filterSignal === 'ALL') return true;
//     if (filterSignal === 'HOLDINGS') return item.has_open_cycle;
//     if (filterSignal === 'BUY') return item.signal === 'BUY' && !item.has_open_cycle;
//     if (filterSignal === 'SELL') return item.signal === 'SELL';
//     if (filterSignal === 'NEUTRAL') return item.signal === 'NEUTRAL' || item.signal === 'HOLD';
//     return true;
//   });

//   // Login/Signup Screen
//   if (!isAuthenticated) {
//     return (
//       <div className="app">
//         <div className="background-grid"></div>
        
//         <div className="login-container">
//           <div className="login-card">
//             <div className="login-header">
//               <Activity size={48} strokeWidth={2.5} className="login-icon" />
//               <h1>MARKET<span>PULSE</span></h1>
//               <p>Smart Trading Made Simple</p>
//             </div>

//             <div className="auth-tabs">
//               <button 
//                 className={authMode === 'login' ? 'active' : ''}
//                 onClick={() => setAuthMode('login')}
//               >
//                 Login
//               </button>
//               <button 
//                 className={authMode === 'signup' ? 'active' : ''}
//                 onClick={() => setAuthMode('signup')}
//               >
//                 Sign Up
//               </button>
//             </div>

//             <form onSubmit={handleAuth} className="login-form">
//               <div className="form-group">
//                 <label>Email</label>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="your@email.com"
//                   required
//                 />
//               </div>

//               <div className="form-group">
//                 <label>Password</label>
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="••••••••"
//                   required
//                 />
//               </div>

//               <button type="submit" className="login-button" disabled={authLoading}>
//                 {authLoading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Create Account'}
//               </button>
//             </form>

//             <div className="login-footer">
//               <p>
//                 {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
//                 <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
//                   {authMode === 'login' ? 'Sign Up' : 'Login'}
//                 </button>
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Notification */}
//         {showNotification && notification && (
//           <div className={`notification ${notification.type} ${showNotification ? 'show' : ''}`}>
//             <Bell size={18} />
//             <span>{notification.message}</span>
//           </div>
//         )}

//         <style jsx>{`
//           .login-container {
//             position: relative;
//             z-index: 1;
//             min-height: 100vh;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             padding: 2rem;
//           }

//           .login-card {
//             background: rgba(15, 20, 25, 0.9);
//             border: 1px solid #1e293b;
//             border-radius: 24px;
//             padding: 3rem;
//             max-width: 450px;
//             width: 100%;
//             box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
//           }

//           .login-header {
//             text-align: center;
//             margin-bottom: 2rem;
//           }

//           .login-icon {
//             color: #10b981;
//             filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.5));
//             margin-bottom: 1rem;
//           }

//           .login-header h1 {
//             font-size: 2rem;
//             font-weight: 900;
//             color: #f1f5f9;
//             margin-bottom: 0.5rem;
//           }
            

//           .login-header h1 span {
//             color: #10b981;
//           }

//           .login-header p {
//             color: #94a3b8;
//             font-size: 0.95rem;
//           }

//           .auth-tabs {
//             display: flex;
//             gap: 0.5rem;
//             margin-bottom: 2rem;
//             background: rgba(30, 41, 59, 0.3);
//             padding: 0.5rem;
//             border-radius: 12px;
//           }

//           .auth-tabs button {
//             flex: 1;
//             padding: 0.75rem;
//             background: none;
//             border: none;
//             color: #94a3b8;
//             font-weight: 600;
//             font-family: inherit;
//             cursor: pointer;
//             border-radius: 8px;
//             transition: all 0.3s ease;
//           }

//           .auth-tabs button.active {
//             background: linear-gradient(135deg, #10b981, #059669);
//             color: white;
//           }

//           .login-form {
//             display: flex;
//             flex-direction: column;
//             gap: 1.5rem;
//           }

//           .form-group {
//             display: flex;
//             flex-direction: column;
//             gap: 0.5rem;
//           }

//           .form-group label {
//             color: #cbd5e1;
//             font-size: 0.9rem;
//             font-weight: 600;
//           }

//           .form-group input {
//             padding: 1rem;
//             background: rgba(30, 41, 59, 0.5);
//             border: 1px solid #1e293b;
//             border-radius: 10px;
//             color: #f1f5f9;
//             font-family: inherit;
//             font-size: 1rem;
//             transition: all 0.3s ease;
//           }

//           .form-group input:focus {
//             outline: none;
//             border-color: #10b981;
//             box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
//           }

//           .form-group input::placeholder {
//             color: #64748b;
//           }

//           .login-button {
//             padding: 1rem;
//             background: linear-gradient(135deg, #10b981, #059669);
//             color: white;
//             border: none;
//             border-radius: 10px;
//             font-weight: 700;
//             font-size: 1rem;
//             cursor: pointer;
//             font-family: inherit;
//             transition: all 0.3s ease;
//             margin-top: 0.5rem;
//           }

//           .login-button:hover:not(:disabled) {
//             transform: translateY(-2px);
//             box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
//           }

//           .login-button:disabled {
//             opacity: 0.5;
//             cursor: not-allowed;
//           }

//           .login-footer {
//             margin-top: 2rem;
//             text-align: center;
//           }

//           .login-footer p {
//             color: #94a3b8;
//             font-size: 0.9rem;
//           }

//           .login-footer button {
//             background: none;
//             border: none;
//             color: #10b981;
//             font-weight: 600;
//             cursor: pointer;
//             font-family: inherit;
//             text-decoration: underline;
//           }
//         `}</style>

//       </div>
//     );
//   }

//   // Main App (after authentication)
//    return (
//       <div className="app">
//         <div className="background-grid"></div>
        
//         {/* Notification */}
//         {showNotification && notification && (
//           <div className={`notification ${notification.type} ${showNotification ? 'show' : ''}`}>
//             <Bell size={18} />
//             <span>{notification.message}</span>
//           </div>
//         )}
  
//         {/* Header */}
//         <header className="header">
//           <div className="header-content">
//             <div className="logo">
//               <Activity size={32} strokeWidth={2.5} />
//               <h1>MARKET<span>PULSE</span></h1>
//             </div>
//             <nav className="nav">
//               <button 
//                 className={activeTab === 'scanner' ? 'active' : ''}
//                 onClick={() => setActiveTab('scanner')}
//               >
//                 <Search size={18} />
//                 Scanner
//               </button>
//               <button 
//                 className={activeTab === 'analysis' ? 'active' : ''}
//                 onClick={() => setActiveTab('analysis')}
//               >
//                 <BarChart3 size={18} />
//                 Analysis
//               </button>
//               <button 
//                 className={activeTab === 'cycles' ? 'active' : ''}
//                 onClick={() => setActiveTab('cycles')}
//               >
//                 <History size={18} />
//                 Trade Cycles
//               </button>
//             </nav>
//              <div className="user-section">
//                 <div className="user-info">
//                           <User size={18} />
//                           <span>{user?.email}</span>
//                         </div>
//                         <button className="logout-btn" onClick={handleLogout}>
//                           <LogOut size={18} />
//                           Logout
//                         </button>
//               </div>
//           </div>
//         </header>
  
//         {/* Main Content */}
//         <main className="main-content">
//           {/* SCANNER TAB */}
//           {activeTab === 'scanner' && (
//             <div className="scanner-page">
//               <div className="scanner-header">
//                 <div className="scanner-title-section">
//                   <h2 className="page-title">
//                     <Search size={32} />
//                     Market Scanner
//                   </h2>
//                   <p className="page-subtitle">Real-time signals for all available symbols</p>
//                 </div>
                
//                 <div className="scanner-actions">
//                   <button 
//                     className="refresh-btn"
//                     onClick={fetchScanner}
//                     disabled={scannerLoading}
//                   >
//                     {scannerLoading ? 'Scanning...' : 'Refresh Scanner'}
//                   </button>
//                 </div>
//               </div>
  
//               {scannerSummary && (
//                 <div className="summary-cards">
//                   <div className="summary-card">
//                     <div className="summary-icon">📊</div>
//                     <div className="summary-content">
//                       <div className="summary-value">{scannerSummary.total_symbols}</div>
//                       <div className="summary-label">Total Symbols</div>
//                     </div>
//                   </div>
  
//                   <div className="summary-card buy">
//                     <div className="summary-icon">🔼</div>
//                     <div className="summary-content">
//                       <div className="summary-value">{scannerSummary.buy_signals}</div>
//                       <div className="summary-label">Buy Signals</div>
//                     </div>
//                   </div>
  
//                   <div className="summary-card sell">
//                     <div className="summary-icon">🔽</div>
//                     <div className="summary-content">
//                       <div className="summary-value">{scannerSummary.sell_signals}</div>
//                       <div className="summary-label">Sell Signals</div>
//                     </div>
//                   </div>
  
//                   <div className="summary-card neutral">
//                     <div className="summary-icon">➖</div>
//                     <div className="summary-content">
//                       <div className="summary-value">{scannerSummary.neutral_signals}</div>
//                       <div className="summary-label">Neutral</div>
//                     </div>
//                   </div>
  
//                   <div className="summary-card active">
//                     <div className="summary-icon">📈</div>
//                     <div className="summary-content">
//                       <div className="summary-value">{scannerSummary.open_positions}</div>
//                       <div className="summary-label">Open Positions</div>
//                     </div>
//                   </div>
//                 </div>
//               )}
  
//               {/* <div className="scanner-filters">
//                 <button 
//                   className={`filter-btn ${filterSignal === 'ALL' ? 'active' : ''}`}
//                   onClick={() => setFilterSignal('ALL')}
//                 >
//                   All ({scannerData.length})
//                 </button>
//                 <button 
//                   className={`filter-btn buy ${filterSignal === 'BUY' ? 'active' : ''}`}
//                   onClick={() => setFilterSignal('BUY')}
//                 >
//                   Buy ({scannerData.filter(s => s.signal === 'BUY').length})
//                 </button>
//                 <button 
//                   className={`filter-btn sell ${filterSignal === 'SELL' ? 'active' : ''}`}
//                   onClick={() => setFilterSignal('SELL')}
//                 >
//                   Sell ({scannerData.filter(s => s.signal === 'SELL').length})
//                 </button>
//                 <button 
//                   className={`filter-btn neutral ${filterSignal === 'NEUTRAL' ? 'active' : ''}`}
//                   onClick={() => setFilterSignal('NEUTRAL')}
//                 >
//                   Neutral ({scannerData.filter(s => s.signal === 'NEUTRAL').length})
//                 </button>
//               </div> */}
//               <div className="scanner-filters">
//               <button 
//                 className={`filter-btn ${filterSignal === 'ALL' ? 'active' : ''}`}
//                 onClick={() => setFilterSignal('ALL')}
//               >
//                 All ({scannerData.length})
//               </button>
//               <button 
//                 className={`filter-btn holdings ${filterSignal === 'HOLDINGS' ? 'active' : ''}`}
//                 onClick={() => setFilterSignal('HOLDINGS')}
//               >
//                 Holdings ({scannerData.filter(s => s.has_open_cycle).length})
//               </button>
//               <button 
//                 className={`filter-btn buy ${filterSignal === 'BUY' ? 'active' : ''}`}
//                 onClick={() => setFilterSignal('BUY')}
//               >
//                 Buy ({scannerData.filter(s => s.signal === 'BUY' && !s.has_open_cycle).length})
//               </button>
//               <button 
//                 className={`filter-btn sell ${filterSignal === 'SELL' ? 'active' : ''}`}
//                 onClick={() => setFilterSignal('SELL')}
//               >
//                 Sell ({scannerData.filter(s => s.signal === 'SELL').length})
//               </button>
//               <button 
//                 className={`filter-btn neutral ${filterSignal === 'NEUTRAL' ? 'active' : ''}`}
//                 onClick={() => setFilterSignal('NEUTRAL')}
//               >
//                 Neutral ({scannerData.filter(s => s.signal === 'NEUTRAL' || s.signal === 'HOLD').length})
//               </button>
//             </div>
  
//               <div className="scanner-grid">
//                 {filteredScannerData.map((item, index) => (
//                   <div key={index} className={`scanner-card ${item.signal_class}`}>
//                     <div className="scanner-card-header">
//                       <div className="symbol-name">{item.symbol}</div>
//                       <div className={`signal-badge ${item.signal_class}`}>
//                         {item.signal}
//                       </div>
//                     </div>
  
//                     <div className="scanner-card-body">
//                       <div className="price-section">
//                         <div className="price-label">Current Price</div>
//                         <div className="price-value">NPR {item.current_price.toFixed(2)}</div>
//                       </div>
  
//                       <div className="rsi-section">
//                         <div className="rsi-label">RSI</div>
//                         <div className={`rsi-value ${item.signal_class}`}>
//                           {item.current_rsi}
//                         </div>
//                       </div>
//                     </div>
  
//                     {item.has_open_cycle && item.open_cycle && (
//                       <div className="open-cycle-info">
//                         <div className="cycle-badge">
//                           📍 Cycle #{item.open_cycle.cycle_number} Open
//                         </div>
//                         <div className="cycle-details">
//                           <div className="cycle-row">
//                             <span>Buy Price:</span>
//                             <strong>NPR {item.open_cycle.buy_price.toFixed(2)}</strong>
//                           </div>
//                           <div className="cycle-row">
//                             <span>Highest:</span>
//                             <strong>NPR {item.open_cycle.highest_price.toFixed(2)}</strong>
//                           </div>
//                           <div className="cycle-row">
//                             <span>TSL (5%):</span>
//                             <strong>NPR {item.open_cycle.tsl_price.toFixed(2)}</strong>
//                           </div>
//                           <div className="cycle-row">
//                             <span>Unrealized P/L:</span>
//                             <strong className={item.open_cycle.unrealized_pnl >= 0 ? 'profit' : 'loss'}>
//                               {item.open_cycle.unrealized_pnl.toFixed(2)}%
//                             </strong>
//                           </div>
//                         </div>
//                       </div>
//                     )}
  
//                     {/* <div className="scanner-card-footer">
//                       <button 
//                         className="detail-btn"
//                         onClick={() => {
//                           setSelectedSymbol(item.symbol);
//                           setActiveTab('analysis');
//                         }}
//                       >
//                         View Details
//                       </button>
//                       {!item.has_open_cycle && item.signal === 'BUY' && (
//                         <button 
//                           className="trade-btn buy"
//                           onClick={() => executeTrade(
//                             item.symbol, 'BUY', item.date, 
//                             item.current_price, item.current_rsi
//                           )}
//                         >
//                           Execute Buy
//                         </button>
//                       )}
//                       {item.has_open_cycle && item.signal === 'SELL' && (
//                         <button 
//                           className="trade-btn sell"
//                           onClick={() => executeTrade(
//                             item.symbol, 'SELL', item.date,
//                             item.current_price, item.current_rsi
//                           )}
//                         >
//                           Execute Sell
//                         </button>
//                       )}
//                     </div> */}
//                     <div className="scanner-card-footer">
//                       <button 
//                         className="detail-btn"
//                         onClick={() => {
//                           setSelectedSymbol(item.symbol);
//                           setActiveTab('analysis');
//                         }}
//                       >
//                         View Details
//                       </button>
                      
//                       {/* BUY button - only if eligible */}
//                       {!item.has_open_cycle && item.signal === 'BUY' && item.can_buy && (
//                         <button 
//                           className="trade-btn buy"
//                           onClick={() => executeTrade(
//                             item.symbol, 'BUY', item.date, 
//                             item.current_price, item.current_rsi
//                           )}
//                         >
//                           Execute Buy
//                         </button>
//                       )}
                      
//                       {/* Turnover warning - if not eligible */}
//                       {!item.has_open_cycle && item.signal === 'BUY' && !item.can_buy && (
//                         <div className="turnover-warning">
//                           ⚠️ Not in top 15 turnover
//                         </div>
//                       )}
                      
//                       {/* SELL button - automatic sell */}
//                       {item.has_open_cycle && item.signal === 'SELL' && (
//                         <button 
//                           className="trade-btn sell"
//                           onClick={() => executeTrade(
//                             item.symbol, 'SELL', item.date,
//                             item.current_price, item.current_rsi
//                           )}
//                         >
//                           Execute Sell
//                         </button>
//                       )}
                      
//                       {/* MANUAL SELL button - always available for holdings */}
//                       {item.has_open_cycle && (
//                         <button 
//                           className="trade-btn manual-sell"
//                           onClick={() => openManualSellModal(item)}
//                         >
//                           Manual Sell
//                         </button>
//                       )}

                      
//                     </div>
//                   </div>
//                 ))}
//               </div>
  
//               {filteredScannerData.length === 0 && (
//                 <div className="empty-state">
//                   <Search size={64} />
//                   <h3>No symbols found</h3>
//                   <p>Try changing the filter or refresh the scanner</p>
//                 </div>
//               )}
//             </div>
//           )}
  
//           {/* ANALYSIS TAB - Keep existing analysis code */}
//           {activeTab === 'analysis' && (
//             <div className="analysis-page">
//               <div className="analysis-layout">
//                 {/* Left Sidebar - Controls */}
//                 <aside className="controls-panel">
//                   <div className="panel-section">
//                     <h3 className="panel-title">
//                       <Database size={20} />
//                       Select Symbol
//                     </h3>
//                     <div className="symbol-selector">
//                       <select
//                         value={selectedSymbol}
//                         onChange={(e) => setSelectedSymbol(e.target.value)}
//                         className="symbol-select"
//                       >
//                         {symbols.map(symbol => (
//                           <option key={symbol} value={symbol}>{symbol}</option>
//                         ))}
//                       </select>
//                     </div>
                    
//                     {statistics && (
//                       <div className="upload-info">
//                         <div className="info-row">
//                           <span>Symbol:</span>
//                           <strong>{selectedSymbol}</strong>
//                         </div>
//                         <div className="info-row">
//                           <span>Current Price:</span>
//                           <strong>NPR {statistics.current_price?.toFixed(2)}</strong>
//                         </div>
//                         <div className="info-row">
//                           <span>Date Range:</span>
//                           <strong>{statistics.date_range?.start} to {statistics.date_range?.end}</strong>
//                         </div>
//                       </div>
//                     )}
//                   </div>
  
//                   <div className="panel-section">
//                     <h3 className="panel-title">
//                       <Settings size={20} />
//                       RSI Settings
//                     </h3>
                    
//                     <div className="setting-group">
//                       <label>RSI Period</label>
//                       <input
//                         type="number"
//                         value={rsiPeriod}
//                         onChange={(e) => setRsiPeriod(parseInt(e.target.value))}
//                         min="2"
//                         max="100"
//                         className="setting-input"
//                       />
//                       <span className="setting-hint">Default: 14 days</span>
//                     </div>
  
//                     <div className="setting-group">
//                       <label>Upper Threshold (Buy)</label>
//                       <input
//                         type="number"
//                         value={upperThreshold}
//                         onChange={(e) => setUpperThreshold(parseInt(e.target.value))}
//                         min="50"
//                         max="100"
//                         className="setting-input"
//                       />
//                       <div className="threshold-bar">
//                         <div className="threshold-fill buy" style={{width: `${upperThreshold}%`}}></div>
//                       </div>
//                     </div>
  
//                     <div className="setting-group">
//                       <label>Lower Threshold (Sell)</label>
//                       <input
//                         type="number"
//                         value={lowerThreshold}
//                         onChange={(e) => setLowerThreshold(parseInt(e.target.value))}
//                         min="0"
//                         max="50"
//                         className="setting-input"
//                       />
//                       <div className="threshold-bar">
//                         <div className="threshold-fill sell" style={{width: `${lowerThreshold}%`}}></div>
//                       </div>
//                     </div>
  
//                     <button 
//                       className="analyze-button"
//                       onClick={analyzeData}
//                       disabled={!selectedSymbol || loading}
//                     >
//                       {loading ? 'Analyzing...' : 'Analyze Data'}
//                     </button>
//                   </div>
  
//                   {latestSignal && (
//                     <div className={`signal-alert ${latestSignal.type.toLowerCase()}`}>
//                       <AlertCircle size={24} />
//                       <div>
//                         <div className="signal-type">{latestSignal.type}</div>
//                         <div className="signal-message">{latestSignal.message}</div>
//                       </div>
//                     </div>
//                   )}
  
//                   {statistics && (
//                     <div className="panel-section">
//                       <h3 className="panel-title">Statistics</h3>
//                       <div className="stats-grid">
//                         <div className="stat-item">
//                           <span>Total Signals</span>
//                           <strong>{statistics.total_signals}</strong>
//                         </div>
//                         <div className="stat-item buy">
//                           <span>Buy Signals</span>
//                           <strong>{statistics.buy_signals}</strong>
//                         </div>
//                         <div className="stat-item sell">
//                           <span>Sell Signals</span>
//                           <strong>{statistics.sell_signals}</strong>
//                         </div>
//                         <div className="stat-item">
//                           <span>Current RSI</span>
//                           <strong>{statistics.current_rsi?.toFixed(2) || 'N/A'}</strong>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </aside>
  
//                 {/* Main Chart Area */}
//                 <div className="chart-area">
//                   {chartData.length > 0 ? (
//                     <>
//                       <div className="chart-container">
//                         <h3 className="chart-title">Price Chart</h3>
//                         <ResponsiveContainer width="100%" height={300}>
//                           <LineChart data={chartData}>
//                             <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" />
//                             <XAxis dataKey="date" stroke="#64748b" tick={{fill: '#94a3b8'}} />
//                             <YAxis stroke="#64748b" tick={{fill: '#94a3b8'}} />
//                             <Tooltip contentStyle={{
//                               backgroundColor: '#0f1419',
//                               border: '1px solid #1e293b',
//                               borderRadius: '8px'
//                             }} />
//                             <Legend />
//                             <Line type="monotone" dataKey="close" stroke="#10b981" strokeWidth={2} dot={false} name="Close Price" />
//                           </LineChart>
//                         </ResponsiveContainer>
//                       </div>
  
//                       <div className="chart-container">
//                         <h3 className="chart-title">RSI Indicator</h3>
//                         <ResponsiveContainer width="100%" height={250}>
//                           <LineChart data={chartData}>
//                             <CartesianGrid strokeDasharray="3 3" stroke="#1a1f2e" />
//                             <XAxis dataKey="date" stroke="#64748b" tick={{fill: '#94a3b8'}} />
//                             <YAxis domain={[0, 100]} stroke="#64748b" tick={{fill: '#94a3b8'}} />
//                             <Tooltip contentStyle={{
//                               backgroundColor: '#0f1419',
//                               border: '1px solid #1e293b',
//                               borderRadius: '8px'
//                             }} />
//                             <Legend />
//                             <ReferenceLine y={upperThreshold} stroke="#10b981" strokeDasharray="3 3" label="Buy Zone" />
//                             <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="3 3" label="Neutral" />
//                             <ReferenceLine y={lowerThreshold} stroke="#ef4444" strokeDasharray="3 3" label="Sell Zone" />
//                             <Line type="monotone" dataKey="rsi" stroke="#3b82f6" strokeWidth={2} dot={false} name="RSI" />
//                           </LineChart>
//                         </ResponsiveContainer>
//                       </div>
  
//                       {signals.length > 0 && (
//                         <div className="signals-list">
//                           <h3 className="chart-title">Trading Signals</h3>
//                           <div className="signals-container">
//                             {signals.slice().reverse().map((signal, index) => (
//                               <div key={index} className={`signal-item ${signal.type.toLowerCase()}`}>
//                                 {signal.type === 'BUY' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
//                                 <div className="signal-details">
//                                   <div className="signal-header">
//                                     <strong>{signal.type}</strong>
//                                     <span className="signal-date">{signal.date}</span>
//                                   </div>
//                                   <div className="signal-info">
//                                     <span>Price: NPR {signal.price.toFixed(2)}</span>
//                                     <span>RSI: {signal.rsi.toFixed(2)}</span>
//                                   </div>
//                                   <div className="signal-msg">{signal.message}</div>
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </>
//                   ) : (
//                     <div className="empty-state">
//                       <Activity size={64} />
//                       <h3>No Data Yet</h3>
//                       <p>Select a symbol and configure your RSI settings to view analysis</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
  
//           {/* CYCLES TAB */}
//           {activeTab === 'cycles' && (
//             <div className="cycles-page">
//               <div className="cycles-header">
//                 <h2 className="page-title">
//                   <History size={32} />
//                   Trade Cycles History
//                 </h2>
//                 <button className="refresh-btn" onClick={() => fetchCycles()} disabled={cyclesLoading}>
//                   {cyclesLoading ? 'Loading...' : 'Refresh'}
//                 </button>
//               </div>
  
//               <div className="cycles-container">
//                 {allCycles.length > 0 ? (
//                   <div className="cycles-table-wrapper">
//                     <table className="cycles-table">
//                       <thead>
//                         <tr>
//                           <th>Cycle #</th>
//                           <th>Symbol</th>
//                           <th>Status</th>
//                           <th>Buy Date</th>
//                           <th>Buy Price</th>
//                           <th>Buy RSI</th>
//                           <th>Sell Date</th>
//                           <th>Sell Price</th>
//                           <th>Sell RSI</th>
//                           <th>Highest Price</th>
//                           <th>TSL (5%)</th>
//                           <th>P/L</th>
//                           <th>P/L %</th>
//                           <th>Reason</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {allCycles.map((cycle) => (
//                           <tr key={cycle.id} className={cycle.status === 'OPEN' ? 'open-cycle' : ''}>
//                             <td>#{cycle.cycle_number}</td>
//                             <td><strong>{cycle.symbol}</strong></td>
//                             <td>
//                               <span className={`status-badge ${cycle.status.toLowerCase()}`}>
//                                 {cycle.status}
//                               </span>
//                             </td>
//                             <td>{cycle.buy_date}</td>
//                             <td>NPR {cycle.buy_price.toFixed(2)}</td>
//                             <td>{cycle.buy_rsi.toFixed(2)}</td>
//                             <td>{cycle.sell_date || '-'}</td>
//                             <td>{cycle.sell_price ? `NPR ${cycle.sell_price.toFixed(2)}` : '-'}</td>
//                             <td>{cycle.sell_rsi ? cycle.sell_rsi.toFixed(2) : '-'}</td>
//                             <td>NPR {cycle.highest_price_after_buy.toFixed(2)}</td>
//                             <td>NPR {cycle.tsl_trigger_price.toFixed(2)}</td>
//                             <td className={cycle.profit_loss >= 0 ? 'profit' : 'loss'}>
//                               {cycle.profit_loss ? `NPR ${cycle.profit_loss.toFixed(2)}` : '-'}
//                             </td>
//                             <td className={cycle.profit_loss_percent >= 0 ? 'profit' : 'loss'}>
//                               {cycle.profit_loss_percent ? `${cycle.profit_loss_percent.toFixed(2)}%` : '-'}
//                             </td>
//                             <td>
//                               {cycle.sell_reason && (
//                                 <span className={`reason-badge ${cycle.sell_reason.toLowerCase().split(':')[0]}`}>
//                                   {cycle.sell_reason}
//                                 </span>
//                               )}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   <div className="empty-state">
//                     <History size={64} />
//                     <h3>No Trade Cycles</h3>
//                     <p>Execute trades from the Scanner to create trade cycles</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </main>
  
//         <style jsx>{`
//           * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//           }
  
//           body {
//             font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
//             background: #0a0e1a;
//             color: #e2e8f0;
//           }
  
//           .app {
//             min-height: 100vh;
//             position: relative;
//           }

//           .reason-badge {
//             padding: 0.3rem 0.6rem;
//             border-radius: 4px;
//             font-size: 0.75rem;
//             font-weight: 700;
//             text-transform: uppercase;
//           }

          

//           .reason-badge.rsi {
//             background: rgba(239, 68, 68, 0.2);
//             color: #ef4444;
//           }

//           .reason-badge.tsl {
//             background: rgba(245, 158, 11, 0.2);
//             color: #f59e0b;
//           }

//           .reason-badge.manual {
//             background: rgba(139, 92, 246, 0.2);
//             color: #8b5cf6;
// }
  
//           .background-grid {
//             position: fixed;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             background-image: 
//               linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
//               linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
//             background-size: 40px 40px;
//             z-index: 0;
//             pointer-events: none;
//           }
  
//           .header {
//             position: relative;
//             z-index: 10;
//             background: rgba(15, 20, 25, 0.8);
//             backdrop-filter: blur(10px);
//             border-bottom: 1px solid #1e293b;
//           }
  
//           .header-content {
//             max-width: 1600px;
//             margin: 0 auto;
//             padding: 1.5rem 2rem;
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//           }
  
//           .logo {
//             display: flex;
//             align-items: center;
//             gap: 0.75rem;
//           }
  
//           .logo svg {
//             color: #10b981;
//             filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.5));
//           }
  
//           .logo h1 {
//             font-size: 1.5rem;
//             font-weight: 800;
//             letter-spacing: -0.02em;
//             color: #f1f5f9;
//           }
  
//           .logo h1 span {
//             color: #10b981;
//           }
  
//           .nav {
//             display: flex;
//             gap: 0.5rem;
//           }

//           .user-section {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//           }

//           .user-info {
//             display: flex;
//             align-items: center;
//             gap: 0.5rem;
//             padding: 0.5rem 1rem;
//             background: rgba(30, 41, 59, 0.5);
//             border-radius: 8px;
//             color: #94a3b8;
//             font-size: 0.9rem;
//           }

//           .logout-btn {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.5rem 1rem;
//           background: rgba(239, 68, 68, 0.1);
//           border: 1px solid rgba(239, 68, 68, 0.3);
//           color: #ef4444;
//           border-radius: 8px;
//           cursor: pointer;
//           font-weight: 600;
//           font-family: inherit;
//           transition: all 0.3s ease;
//           }

//           .logout-btn:hover {
//           background: rgba(239, 68, 68, 0.2);
//           transform: translateY(-2px);
//           }

//           .filter-btn.holdings.active {
//           background: rgba(59, 130, 246, 0.15);
//           border-color: #3b82f6;
//            color: #3b82f6;
//           } 
  
//           .nav button {
//             background: none;
//             border: none;
//             color: #94a3b8;
//             padding: 0.75rem 1.5rem;
//             cursor: pointer;
//             font-size: 0.95rem;
//             font-weight: 600;
//             font-family: inherit;
//             transition: all 0.3s ease;
//             border-radius: 8px;
//             display: flex;
//             align-items: center;
//             gap: 0.5rem;
//           }
  
//           .nav button:hover {
//             color: #10b981;
//             background: rgba(16, 185, 129, 0.1);
//           }
  
//           .nav button.active {
//             color: #10b981;
//             background: rgba(16, 185, 129, 0.15);
//           }
  
//           .main-content {
//             position: relative;
//             z-index: 1;
//             max-width: 1600px;
//             margin: 0 auto;
//             padding: 2rem;
//           }
  
//           /* Scanner Page Styles */
//           .scanner-page {
//             padding: 1rem 0;
//           }
  
//           .scanner-header {
//             display: flex;
//             justify-content: space-between;
//             align-items: flex-start;
//             margin-bottom: 2rem;
//           }
  
//           .scanner-title-section {
//             flex: 1;
//           }
  
//           .page-title {
//             display: flex;
//             align-items: center;
//             gap: 1rem;
//             font-size: 2.5rem;
//             font-weight: 900;
//             color: #f1f5f9;
//             margin-bottom: 0.5rem;
//           }
  
//           .page-subtitle {
//             color: #94a3b8;
//             font-size: 1.1rem;
//           }
  
//           .refresh-btn {
//             background: linear-gradient(135deg, #10b981, #059669);
//             color: white;
//             border: none;
//             padding: 0.75rem 1.5rem;
//             border-radius: 8px;
//             font-weight: 600;
//             cursor: pointer;
//             font-family: inherit;
//             transition: all 0.3s ease;
//           }
  
//           .refresh-btn:hover:not(:disabled) {
//             transform: translateY(-2px);
//             box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
//           }
  
//           .refresh-btn:disabled {
//             opacity: 0.5;
//             cursor: not-allowed;
//           }
  
//           .summary-cards {
//             display: grid;
//             grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//             gap: 1.5rem;
//             margin-bottom: 2rem;
//           }
  
//           .summary-card {
//             background: rgba(15, 20, 25, 0.6);
//             border: 1px solid #1e293b;
//             border-radius: 12px;
//             padding: 1.5rem;
//             display: flex;
//             align-items: center;
//             gap: 1rem;
//             transition: all 0.3s ease;
//           }
  
//           .summary-card:hover {
//             transform: translateY(-2px);
//             border-color: #10b981;
//           }
  
//           .summary-card.buy {
//             border-color: rgba(16, 185, 129, 0.3);
//             background: rgba(16, 185, 129, 0.05);
//           }
  
//           .summary-card.sell {
//             border-color: rgba(239, 68, 68, 0.3);
//             background: rgba(239, 68, 68, 0.05);
//           }
  
//           .summary-card.neutral {
//             border-color: rgba(100, 116, 139, 0.3);
//             background: rgba(100, 116, 139, 0.05);
//           }
  
//           .summary-card.active {
//             border-color: rgba(59, 130, 246, 0.3);
//             background: rgba(59, 130, 246, 0.05);
//           }
  
//           .summary-icon {
//             font-size: 2rem;
//           }
  
//           .summary-value {
//             font-size: 2rem;
//             font-weight: 800;
//             color: #f1f5f9;
//           }
  
//           .summary-label {
//             font-size: 0.85rem;
//             color: #94a3b8;
//             text-transform: uppercase;
//             letter-spacing: 0.05em;
//           }
  
//           .scanner-filters {
//             display: flex;
//             gap: 1rem;
//             margin-bottom: 2rem;
//           }
  
//           .filter-btn {
//             background: rgba(30, 41, 59, 0.5);
//             border: 1px solid #1e293b;
//             color: #94a3b8;
//             padding: 0.75rem 1.5rem;
//             border-radius: 8px;
//             font-weight: 600;
//             cursor: pointer;
//             font-family: inherit;
//             transition: all 0.3s ease;
//           }
  
//           .filter-btn:hover {
//             border-color: #10b981;
//             color: #10b981;
//           }
  
//           .filter-btn.active {
//             background: rgba(16, 185, 129, 0.15);
//             border-color: #10b981;
//             color: #10b981;
//           }
  
//           .filter-btn.buy.active {
//             background: rgba(16, 185, 129, 0.15);
//             border-color: #10b981;
//             color: #10b981;
//           }
  
//           .filter-btn.sell.active {
//             background: rgba(239, 68, 68, 0.15);
//             border-color: #ef4444;
//             color: #ef4444;
//           }
  
//           .filter-btn.neutral.active {
//             background: rgba(100, 116, 139, 0.15);
//             border-color: #64748b;
//             color: #94a3b8;
//           }
  
//           .scanner-grid {
//             display: grid;
//             grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
//             gap: 1.5rem;
//           }
  
//           .scanner-card {
//             background: rgba(15, 20, 25, 0.8);
//             border: 1px solid #1e293b;
//             border-radius: 12px;
//             padding: 1.5rem;
//             transition: all 0.3s ease;
//           }
  
//           .scanner-card:hover {
//             transform: translateY(-4px);
//             box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
//           }
  
//           .scanner-card.buy {
//             border-left: 3px solid #10b981;
//           }
  
//           .scanner-card.sell {
//             border-left: 3px solid #ef4444;
//           }
  
//           .scanner-card.neutral {
//             border-left: 3px solid #64748b;
//           }
  
//           .scanner-card-header {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             margin-bottom: 1rem;
//           }
  
//           .symbol-name {
//             font-size: 1.5rem;
//             font-weight: 800;
//             color: #f1f5f9;
//           }
  
//           .signal-badge {
//             padding: 0.4rem 0.8rem;
//             border-radius: 6px;
//             font-size: 0.75rem;
//             font-weight: 700;
//             text-transform: uppercase;
//             letter-spacing: 0.05em;
//           }
  
//           .signal-badge.buy {
//             background: rgba(16, 185, 129, 0.2);
//             color: #10b981;
//           }
  
//           .signal-badge.sell {
//             background: rgba(239, 68, 68, 0.2);
//             color: #ef4444;
//           }
  
//           .signal-badge.neutral {
//             background: rgba(100, 116, 139, 0.2);
//             color: #94a3b8;
//           }
  
//           .scanner-card-body {
//             display: grid;
//             grid-template-columns: 1fr 1fr;
//             gap: 1rem;
//             margin-bottom: 1rem;
//           }
  
//           .price-section, .rsi-section {
//             text-align: center;
//           }
  
//           .price-label, .rsi-label {
//             font-size: 0.8rem;
//             color: #64748b;
//             margin-bottom: 0.5rem;
//           }
  
//           .price-value {
//             font-size: 1.5rem;
//             font-weight: 700;
//             color: #f1f5f9;
//           }
  
//           .rsi-value {
//             font-size: 1.5rem;
//             font-weight: 700;
//           }
  
//           .rsi-value.buy {
//             color: #10b981;
//           }
  
//           .rsi-value.sell {
//             color: #ef4444;
//           }
  
//           .rsi-value.neutral {
//             color: #94a3b8;
//           }
  
//           .open-cycle-info {
//             background: rgba(59, 130, 246, 0.1);
//             border: 1px solid rgba(59, 130, 246, 0.3);
//             border-radius: 8px;
//             padding: 1rem;
//             margin-bottom: 1rem;
//           }
  
//           .cycle-badge {
//             font-size: 0.85rem;
//             font-weight: 700;
//             color: #3b82f6;
//             margin-bottom: 0.75rem;
//           }
  
//           .cycle-details {
//             display: flex;
//             flex-direction: column;
//             gap: 0.5rem;
//           }
  
//           .cycle-row {
//             display: flex;
//             justify-content: space-between;
//             font-size: 0.85rem;
//           }
  
//           .cycle-row span {
//             color: #94a3b8;
//           }
  
//           .cycle-row strong {
//             color: #f1f5f9;
//           }
  
//           .cycle-row .profit {
//             color: #10b981;
//           }
  
//           .cycle-row .loss {
//             color: #ef4444;
//           }
  
//           .scanner-card-footer {
//             display: flex;
//             gap: 0.75rem;
//           }
  
//           .detail-btn, .trade-btn {
//             flex: 1;
//             padding: 0.75rem;
//             border: none;
//             border-radius: 8px;
//             font-weight: 600;
//             cursor: pointer;
//             font-family: inherit;
//             transition: all 0.3s ease;
//           }
  
//           .detail-btn {
//             background: rgba(30, 41, 59, 0.5);
//             color: #94a3b8;
//             border: 1px solid #1e293b;
//           }
  
//           .detail-btn:hover {
//             background: rgba(30, 41, 59, 0.8);
//             color: #f1f5f9;
//           }
  
//           .trade-btn.buy {
//             background: linear-gradient(135deg, #10b981, #059669);
//             color: white;
//           }
  
//           .trade-btn.sell {
//             background: linear-gradient(135deg, #ef4444, #dc2626);
//             color: white;
//           }
  
//           .trade-btn:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
//           }
  
//           /* Cycles Page Styles */
//           .cycles-page {
//             padding: 1rem 0;
//           }
  
//           .cycles-header {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             margin-bottom: 2rem;
//           }
  
//           .cycles-table-wrapper {
//             background: rgba(15, 20, 25, 0.8);
//             border: 1px solid #1e293b;
//             border-radius: 12px;
//             padding: 1.5rem;
//             overflow-x: auto;
//           }
  
//           .cycles-table {
//             width: 100%;
//             border-collapse: collapse;
//           }
  
//           .cycles-table th {
//             background: rgba(30, 41, 59, 0.5);
//             padding: 1rem;
//             text-align: left;
//             font-size: 0.85rem;
//             font-weight: 700;
//             color: #10b981;
//             text-transform: uppercase;
//             letter-spacing: 0.05em;
//             border-bottom: 2px solid #1e293b;
//           }
  
//           .cycles-table td {
//             padding: 1rem;
//             border-bottom: 1px solid #1e293b;
//             font-size: 0.9rem;
//           }
  
//           .cycles-table tr:hover {
//             background: rgba(30, 41, 59, 0.3);
//           }
  
//           .cycles-table tr.open-cycle {
//             background: rgba(59, 130, 246, 0.05);
//           }
  
//           .status-badge {
//             padding: 0.3rem 0.6rem;
//             border-radius: 4px;
//             font-size: 0.75rem;
//             font-weight: 700;
//             text-transform: uppercase;
//           }
  
//           .status-badge.open {
//             background: rgba(59, 130, 246, 0.2);
//             color: #3b82f6;
//           }
  
//           .status-badge.closed {
//             background: rgba(100, 116, 139, 0.2);
//             color: #94a3b8;
//           }
  
//           .profit {
//             color: #10b981;
//             font-weight: 700;
//           }
  
//           .loss {
//             color: #ef4444;
//             font-weight: 700;
//           }
  
//           /* Analysis Page - Keep existing styles */
//           .analysis-layout {
//             display: grid;
//             grid-template-columns: 380px 1fr;
//             gap: 2rem;
//             min-height: calc(100vh - 120px);
//           }
  
//           .controls-panel {
//             display: flex;
//             flex-direction: column;
//             gap: 1.5rem;
//           }
  
//           .panel-section {
//             background: rgba(15, 20, 25, 0.8);
//             border: 1px solid #1e293b;
//             border-radius: 16px;
//             padding: 1.5rem;
//           }
  
//           .panel-title {
//             display: flex;
//             align-items: center;
//             gap: 0.5rem;
//             font-size: 1rem;
//             font-weight: 700;
//             margin-bottom: 1.25rem;
//             color: #10b981;
//             text-transform: uppercase;
//             letter-spacing: 0.05em;
//           }
  
//           .symbol-selector {
//             margin-bottom: 1rem;
//           }
  
//           .symbol-select {
//             width: 100%;
//             padding: 0.75rem;
//             background: rgba(30, 41, 59, 0.5);
//             border: 1px solid #1e293b;
//             border-radius: 8px;
//             color: #f1f5f9;
//             font-family: inherit;
//             font-size: 1rem;
//             font-weight: 600;
//             cursor: pointer;
//             transition: all 0.3s ease;
//           }
  
//           .symbol-select:focus {
//             outline: none;
//             border-color: #10b981;
//             box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
//           }
  
//           .upload-info {
//             background: rgba(30, 41, 59, 0.3);
//             border-radius: 8px;
//             padding: 1rem;
//           }
  
//           .info-row {
//             display: flex;
//             justify-content: space-between;
//             padding: 0.5rem 0;
//             font-size: 0.9rem;
//           }
  
//           .info-row span {
//             color: #94a3b8;
//           }
  
//           .info-row strong {
//             color: #f1f5f9;
//           }
  
//           .setting-group {
//             margin-bottom: 1.5rem;
//           }
  
//           .setting-group label {
//             display: block;
//             margin-bottom: 0.5rem;
//             color: #cbd5e1;
//             font-size: 0.9rem;
//             font-weight: 600;
//           }
  
//           .setting-input {
//             width: 100%;
//             padding: 0.75rem;
//             background: rgba(30, 41, 59, 0.5);
//             border: 1px solid #1e293b;
//             border-radius: 8px;
//             color: #f1f5f9;
//             font-family: inherit;
//             font-size: 1rem;
//             transition: all 0.3s ease;
//           }
  
//           .setting-input:focus {
//             outline: none;
//             border-color: #10b981;
//             box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
//           }
  
//           .setting-hint {
//             display: block;
//             margin-top: 0.5rem;
//             font-size: 0.8rem;
//             color: #64748b;
//           }
  
//           .threshold-bar {
//             width: 100%;
//             height: 6px;
//             background: rgba(30, 41, 59, 0.5);
//             border-radius: 3px;
//             overflow: hidden;
//             margin-top: 0.5rem;
//           }
  
//           .threshold-fill {
//             height: 100%;
//             transition: width 0.3s ease;
//           }
  
//           .threshold-fill.buy {
//             background: linear-gradient(90deg, #10b981, #059669);
//           }
  
//           .threshold-fill.sell {
//             background: linear-gradient(90deg, #ef4444, #dc2626);
//           }
  
//           .analyze-button {
//             width: 100%;
//             padding: 1rem;
//             background: linear-gradient(135deg, #10b981, #059669);
//             color: white;
//             border: none;
//             border-radius: 10px;
//             font-weight: 700;
//             font-size: 1rem;
//             cursor: pointer;
//             font-family: inherit;
//             transition: all 0.3s ease;
//             margin-top: 0.5rem;
//           }
  
//           .analyze-button:hover:not(:disabled) {
//             transform: translateY(-2px);
//             box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
//           }
  
//           .analyze-button:disabled {
//             opacity: 0.5;
//             cursor: not-allowed;
//           }
  
//           .signal-alert {
//             display: flex;
//             gap: 1rem;
//             padding: 1.25rem;
//             border-radius: 12px;
//             align-items: flex-start;
//           }
  
//           .signal-alert.overbought {
//             background: rgba(16, 185, 129, 0.1);
//             border: 1px solid rgba(16, 185, 129, 0.3);
//             color: #10b981;
//           }
  
//           .signal-alert.oversold {
//             background: rgba(239, 68, 68, 0.1);
//             border: 1px solid rgba(239, 68, 68, 0.3);
//             color: #ef4444;
//           }
  
//           .signal-alert.neutral {
//             background: rgba(100, 116, 139, 0.1);
//             border: 1px solid rgba(100, 116, 139, 0.3);
//             color: #94a3b8;
//           }
  
//           .signal-type {
//             font-weight: 700;
//             font-size: 0.95rem;
//             text-transform: uppercase;
//             letter-spacing: 0.05em;
//           }
  
//           .signal-message {
//             font-size: 0.9rem;
//             margin-top: 0.25rem;
//             opacity: 0.9;
//           }
  
//           .stats-grid {
//             display: grid;
//             grid-template-columns: repeat(2, 1fr);
//             gap: 1rem;
//           }
  
//           .stat-item {
//             padding: 1rem;
//             background: rgba(30, 41, 59, 0.3);
//             border-radius: 8px;
//             text-align: center;
//           }
  
//           .stat-item span {
//             display: block;
//             font-size: 0.8rem;
//             color: #94a3b8;
//             margin-bottom: 0.5rem;
//           }
  
//           .stat-item strong {
//             font-size: 1.5rem;
//             color: #f1f5f9;
//           }
  
//           .stat-item.buy strong {
//             color: #10b981;
//           }
  
//           .stat-item.sell strong {
//             color: #ef4444;
//           }
  
//           .chart-area {
//             display: flex;
//             flex-direction: column;
//             gap: 2rem;
//           }
  
//           .chart-container {
//             background: rgba(15, 20, 25, 0.8);
//             border: 1px solid #1e293b;
//             border-radius: 16px;
//             padding: 1.5rem;
//           }
  
//           .chart-title {
//             font-size: 1.1rem;
//             font-weight: 700;
//             color: #cbd5e1;
//             margin-bottom: 1.5rem;
//             text-transform: uppercase;
//             letter-spacing: 0.05em;
//           }
  
//           .empty-state {
//             display: flex;
//             flex-direction: column;
//             align-items: center;
//             justify-content: center;
//             min-height: 400px;
//             text-align: center;
//           }
  
//           .empty-state svg {
//             color: #334155;
//             margin-bottom: 1.5rem;
//           }
  
//           .empty-state h3 {
//             font-size: 1.5rem;
//             color: #cbd5e1;
//             margin-bottom: 0.75rem;
//           }
  
//           .empty-state p {
//             color: #64748b;
//             max-width: 400px;
//           }
  
//           .signals-list {
//             background: rgba(15, 20, 25, 0.8);
//             border: 1px solid #1e293b;
//             border-radius: 16px;
//             padding: 1.5rem;
//           }
  
//           .signals-container {
//             display: flex;
//             flex-direction: column;
//             gap: 1rem;
//             max-height: 500px;
//             overflow-y: auto;
//           }
  
//           .signal-item {
//             display: flex;
//             gap: 1rem;
//             padding: 1.25rem;
//             border-radius: 12px;
//             border: 1px solid;
//             transition: all 0.3s ease;
//           }
  
//           .signal-item.buy {
//             background: rgba(16, 185, 129, 0.05);
//             border-color: rgba(16, 185, 129, 0.2);
//             color: #10b981;
//           }
  
//           .signal-item.sell {
//             background: rgba(239, 68, 68, 0.05);
//             border-color: rgba(239, 68, 68, 0.2);
//             color: #ef4444;
//           }
  
//           .signal-item:hover {
//             transform: translateX(4px);
//           }
  
//           .signal-details {
//             flex: 1;
//           }
  
//           .signal-header {
//             display: flex;
//             justify-content: space-between;
//             margin-bottom: 0.5rem;
//           }
  
//           .signal-header strong {
//             font-size: 0.95rem;
//             font-weight: 700;
//           }
  
//           .signal-date {
//             font-size: 0.85rem;
//             opacity: 0.7;
//           }
  
//           .signal-info {
//             display: flex;
//             gap: 1.5rem;
//             font-size: 0.9rem;
//             margin-bottom: 0.5rem;
//             opacity: 0.8;
//           }
  
//           .signal-msg {
//             font-size: 0.85rem;
//             opacity: 0.7;
//           }
  
//           .notification {
//             position: fixed;
//             top: 100px;
//             right: 2rem;
//             display: flex;
//             align-items: center;
//             gap: 0.75rem;
//             padding: 1rem 1.5rem;
//             border-radius: 12px;
//             font-weight: 600;
//             z-index: 1000;
//             transform: translateX(400px);
//             transition: transform 0.4s ease;
//             box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
//           }
  
//           .notification.show {
//             transform: translateX(0);
//           }
  
//           .notification.success {
//             background: rgba(16, 185, 129, 0.15);
//             border: 1px solid rgba(16, 185, 129, 0.3);
//             color: #10b981;
//           }
  
//           .notification.error {
//             background: rgba(239, 68, 68, 0.15);
//             border: 1px solid rgba(239, 68, 68, 0.3);
//             color: #ef4444;
//           }
  
//           @media (max-width: 1200px) {
//             .analysis-layout {
//               grid-template-columns: 1fr;
//             }
  
//             .scanner-grid {
//               grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
//             }
//           }
//         `}</style>

// <ManualSellModal
//   isOpen={showManualSellModal}
//   item={manualSellItem}
//   onClose={closeManualSellModal}
//   onConfirm={confirmManualSell}
// />


//       </div>
//     );
// }

// export default App;


import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Settings, Bell, AlertCircle, Database, Search, BarChart3, History, LogOut, User, X, AlertTriangle } from 'lucide-react';

const API_URL = 'http://localhost:8080/api';

function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState('scanner');
  const [symbols, setSymbols] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [chartData, setChartData] = useState([]);
  const [signals, setSignals] = useState([]);
  const [latestSignal, setLatestSignal] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [scannerData, setScannerData] = useState([]);
  const [scannerSummary, setScannerSummary] = useState(null);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [filterSignal, setFilterSignal] = useState('ALL');
  
  const [allCycles, setAllCycles] = useState([]);
  const [cyclesLoading, setCyclesLoading] = useState(false);
  
  // Manual sell modal state
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellModalData, setSellModalData] = useState(null);
  const [sellReason, setSellReason] = useState('');
  const [sellConfirmation, setSellConfirmation] = useState('');
  
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [upperThreshold, setUpperThreshold] = useState(70);
  const [lowerThreshold, setLowerThreshold] = useState(30);
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) verifyToken(token);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSymbols();
      fetchScanner();
    }
  }, [isAuthenticated]);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: { 'Authorization': token }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      localStorage.removeItem('token');
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/signup';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        setEmail('');
        setPassword('');
        setAuthError('');
        showNotificationMessage(`Welcome ${data.user.email}!`, 'success');
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (error) {
      setAuthError('Connection error. Please check your internet.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setScannerData([]);
    setAllCycles([]);
    showNotificationMessage('Logged out successfully', 'success');
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': localStorage.getItem('token') || ''
  });

  const fetchSymbols = async () => {
    try {
      const response = await fetch(`${API_URL}/symbols`);
      const data = await response.json();
      if (response.ok) {
        setSymbols(data.symbols);
        if (data.symbols.length > 0) setSelectedSymbol(data.symbols[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchScanner = async () => {
    setScannerLoading(true);
    try {
      const response = await fetch(`${API_URL}/scanner`, { headers: getAuthHeaders() });
      const data = await response.json();
      if (response.ok) {
        setScannerData(data.symbols);
        setScannerSummary(data.summary);
      } else {
        if (response.status === 401) handleLogout();
        showNotificationMessage(data.error, 'error');
      }
    } catch (error) {
      showNotificationMessage('Error fetching scanner data', 'error');
    } finally {
      setScannerLoading(false);
    }
  };

  const fetchCycles = async (symbol = null) => {
    setCyclesLoading(true);
    try {
      const url = symbol ? `${API_URL}/cycles/${symbol}` : `${API_URL}/cycles`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      const data = await response.json();
      if (response.ok) {
        setAllCycles(data.cycles);
      } else {
        if (response.status === 401) handleLogout();
        showNotificationMessage(data.error, 'error');
      }
    } catch (error) {
      showNotificationMessage('Error fetching cycles', 'error');
    } finally {
      setCyclesLoading(false);
    }
  };

  const executeTrade = async (symbol, action, date, price, rsi) => {
    try {
      const response = await fetch(`${API_URL}/trade`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ symbol, action, date, price, rsi })
      });
      const data = await response.json();
      if (response.ok) {
        showNotificationMessage(data.message, 'success');
        fetchScanner();
        if (activeTab === 'cycles') fetchCycles();
      } else {
        if (response.status === 401) handleLogout();
        showNotificationMessage(data.error, 'error');
      }
    } catch (error) {
      showNotificationMessage('Error executing trade', 'error');
    }
  };

  const openManualSellModal = (item) => {
    setSellModalData(item);
    setSellReason('');
    setSellConfirmation('');
    setShowSellModal(true);
  };

  const closeManualSellModal = () => {
    setShowSellModal(false);
    setSellModalData(null);
    setSellReason('');
    setSellConfirmation('');
  };

  const executeManualSell = async () => {
    if (!sellReason.trim()) {
      showNotificationMessage('Sell reason is REQUIRED', 'error');
      return;
    }
    if (sellConfirmation.toUpperCase() !== 'CONFIRM') {
      showNotificationMessage('Please type CONFIRM', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/trade/manual-sell`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          symbol: sellModalData.symbol,
          date: sellModalData.date,
          price: sellModalData.current_price,
          rsi: sellModalData.current_rsi,
          reason: sellReason
        })
      });

      const data = await response.json();
      if (response.ok) {
        showNotificationMessage(data.message, 'success');
        closeManualSellModal();
        fetchScanner();
        if (activeTab === 'cycles') fetchCycles();
      } else {
        showNotificationMessage(data.error, 'error');
      }
    } catch (error) {
      showNotificationMessage('Error executing manual sell', 'error');
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
        if (response.status === 401) handleLogout();
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
    if (selectedSymbol && activeTab === 'analysis' && isAuthenticated) {
      analyzeData();
    }
  }, [selectedSymbol, rsiPeriod, upperThreshold, lowerThreshold]);

  useEffect(() => {
    if (activeTab === 'cycles' && isAuthenticated) {
      fetchCycles();
    }
  }, [activeTab]);

  const filteredScannerData = scannerData.filter(item => {
    if (filterSignal === 'ALL') return true;
    if (filterSignal === 'HOLDINGS') return item.has_open_cycle;
    if (filterSignal === 'BUY') return item.signal === 'BUY' && !item.has_open_cycle;
    if (filterSignal === 'SELL') return item.signal === 'SELL';
    if (filterSignal === 'NEUTRAL') return item.signal === 'NEUTRAL' || item.signal === 'HOLD';
    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="app">
        <div className="background-animated"></div>
        
        <div className="login-container">
          <div className="login-card">
            <div className="login-glow"></div>
            <div className="login-header">
              <div className="icon-wrapper">
                <Activity size={56} strokeWidth={2.5} className="login-icon" />
              </div>
              <h1>MARKET<span className="gradient-text">PULSE</span></h1>
              <p className="tagline">Advanced Trading Intelligence</p>
            </div>

            <div className="auth-tabs">
              <button className={authMode === 'login' ? 'active' : ''} onClick={() => { setAuthMode('login'); setAuthError(''); }}>Sign In</button>
              <button className={authMode === 'signup' ? 'active' : ''} onClick={() => { setAuthMode('signup'); setAuthError(''); }}>Create Account</button>
              <div className="tab-indicator" style={{ transform: authMode === 'signup' ? 'translateX(100%)' : 'translateX(0)' }}></div>
            </div>

            {authError && (
              <div className="auth-error">
                <AlertCircle size={18} />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="login-form">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className={authError && authError.toLowerCase().includes('email') ? 'error' : ''} />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className={authError && authError.toLowerCase().includes('password') ? 'error' : ''} />
                {authMode === 'signup' && <span className="input-hint">Minimum 6 characters</span>}
              </div>

              <button type="submit" className="login-button" disabled={authLoading}>
                {authLoading ? <><div className="spinner"></div><span>Processing...</span></> : <span>{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>}
              </button>
            </form>

            <div className="login-footer">
              <p>{authMode === 'login' ? "Don't have an account?" : "Already registered?"}</p>
              <button className="switch-mode" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }}>
                {authMode === 'login' ? 'Create one now' : 'Sign in instead'}
              </button>
            </div>

            <div className="security-badge">
              <div className="badge-icon">🔒</div>
              <div className="badge-text">
                <strong>Secure & Encrypted</strong>
                <span>Your data is protected</span>
              </div>
            </div>
          </div>

          <style jsx>{`
          .login-container {
            position: relative;
            z-index: 1;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .login-card {
            background: rgba(15, 20, 25, 0.9);
            border: 1px solid #1e293b;
            border-radius: 24px;
            padding: 3rem;
            max-width: 450px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          }

          .login-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .login-icon {
            color: #10b981;
            filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.5));
            margin-bottom: 1rem;
          }

          .login-header h1 {
            font-size: 2rem;
            font-weight: 900;
            color: #f1f5f9;
            margin-bottom: 0.5rem;
          }
            

          .login-header h1 span {
            color: #10b981;
          }

          .login-header p {
            color: #94a3b8;
            font-size: 0.95rem;
          }

          .auth-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
            background: rgba(30, 41, 59, 0.3);
            padding: 0.5rem;
            border-radius: 12px;
          }

          .auth-tabs button {
            flex: 1;
            padding: 0.75rem;
            background: none;
            border: none;
            color: #94a3b8;
            font-weight: 600;
            font-family: inherit;
            cursor: pointer;
            border-radius: 8px;
            transition: all 0.3s ease;
          }

          .auth-tabs button.active {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
          }

          .login-form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-group label {
            color: #cbd5e1;
            font-size: 0.9rem;
            font-weight: 600;
          }

          .form-group input {
            padding: 1rem;
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid #1e293b;
            border-radius: 10px;
            color: #f1f5f9;
            font-family: inherit;
            font-size: 1rem;
            transition: all 0.3s ease;
          }

          .form-group input:focus {
            outline: none;
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
          }

          .form-group input::placeholder {
            color: #64748b;
          }

          .login-button {
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

          .login-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
          }

          .login-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .login-footer {
            margin-top: 2rem;
            text-align: center;
          }

          .login-footer p {
            color: #94a3b8;
            font-size: 0.9rem;
          }

          .login-footer button {
            background: none;
            border: none;
            color: #10b981;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            text-decoration: underline;
          }

          /* Add these styles to your existing App.jsx <style jsx> section or import as separate CSS */

/* Enhanced Login Page Styles */
.background-animated {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #0a0e1a;
  z-index: 0;
  overflow: hidden;
}

.background-animated::before {
  content: '';
  position: absolute;
  width: 200%;
  height: 200%;
  background-image: 
    linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.login-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  position: relative;
  background: rgba(10, 14, 26, 0.95);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 28px;
  padding: 3.5rem;
  max-width: 480px;
  width: 100%;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(16, 185, 129, 0.1) inset;
  backdrop-filter: blur(20px);
}

.login-glow {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
  pointer-events: none;
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
  50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
}

.icon-wrapper {
  display: inline-flex;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
  border-radius: 20px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.login-icon {
  color: #10b981;
  filter: drop-shadow(0 0 16px rgba(16, 185, 129, 0.6));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-header h1 {
  font-size: 2.25rem;
  font-weight: 900;
  color: #f1f5f9;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, #10b981, #059669, #10b981);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradientShift 3s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.tagline {
  color: #94a3b8;
  font-size: 0.95rem;
  font-weight: 500;
}

.auth-tabs {
  position: relative;
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: rgba(30, 41, 59, 0.4);
  padding: 0.4rem;
  border-radius: 14px;
  border: 1px solid rgba(30, 41, 59, 0.6);
}

.auth-tabs button {
  flex: 1;
  padding: 0.85rem;
  background: none;
  border: none;
  color: #64748b;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
  font-size: 0.95rem;
}

.auth-tabs button.active {
  color: #f1f5f9;
}

.tab-indicator {
  position: absolute;
  top: 0.4rem;
  left: 0.4rem;
  width: calc(50% - 0.4rem);
  height: calc(100% - 0.8rem);
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 10px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.auth-error {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #ef4444;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-group input.error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.form-group input.error:focus {
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.input-hint {
  font-size: 0.8rem;
  color: #64748b;
  font-style: italic;
}

.login-button {
  padding: 1.15rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1.05rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 0.5rem;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.switch-mode {
  background: none;
  border: none;
  color: #10b981;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.switch-mode:hover {
  background: rgba(16, 185, 129, 0.1);
}

.security-badge {
  margin-top: 2.5rem;
  padding: 1.25rem;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.badge-icon {
  font-size: 1.75rem;
}

.badge-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.badge-text strong {
  color: #3b82f6;
  font-size: 0.9rem;
  font-weight: 700;
}

.badge-text span {
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.4;
}
        `}</style>

        </div>

        {showNotification && notification && (
          <div className={`notification ${notification.type} ${showNotification ? 'show' : ''}`}>
            <Bell size={18} />
            <span>{notification.message}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <div className="background-grid"></div>
      
      {showNotification && notification && (
        <div className={`notification ${notification.type} ${showNotification ? 'show' : ''}`}>
          <Bell size={18} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Manual Sell Modal */}
      {showSellModal && sellModalData && (
        <div className="modal-overlay" onClick={closeManualSellModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><AlertTriangle size={24} />Manual Sell: {sellModalData.symbol}</h3>
              <button className="modal-close" onClick={closeManualSellModal}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="sell-info">
                <div className="sell-info-row"><span>Current Price:</span><strong>NPR {sellModalData.current_price.toFixed(2)}</strong></div>
                <div className="sell-info-row"><span>Current RSI:</span><strong>{sellModalData.current_rsi}</strong></div>
                {sellModalData.open_cycle && (
                  <>
                    <div className="sell-info-row"><span>Buy Price:</span><strong>NPR {sellModalData.open_cycle.buy_price.toFixed(2)}</strong></div>
                    <div className="sell-info-row"><span>Unrealized P/L:</span><strong className={sellModalData.open_cycle.unrealized_pnl >= 0 ? 'profit' : 'loss'}>{sellModalData.open_cycle.unrealized_pnl.toFixed(2)}%</strong></div>
                  </>
                )}
              </div>
              <div className="form-group">
                <label>Reason for Selling * (REQUIRED)</label>
                <textarea value={sellReason} onChange={(e) => setSellReason(e.target.value)} placeholder="Enter your reason (e.g., Market conditions, News event, Personal decision)" rows={4} className="sell-reason-input" />
              </div>
              <div className="form-group">
                <label>Type "CONFIRM" to proceed *</label>
                <input type="text" value={sellConfirmation} onChange={(e) => setSellConfirmation(e.target.value)} placeholder="CONFIRM" className="confirmation-input" />
              </div>
              <div className="warning-box"><AlertCircle size={18} /><span>This action cannot be undone. You MUST provide a reason.</span></div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={closeManualSellModal}>Cancel</button>
              <button className="modal-btn confirm" onClick={executeManualSell} disabled={!sellReason.trim() || sellConfirmation.toUpperCase() !== 'CONFIRM'}>
                Execute Manual Sell
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="header">
        <div className="header-content">
          <div className="logo">
            <Activity size={32} strokeWidth={2.5} />
            <h1>MARKET<span>PULSE</span></h1>
          </div>
          <nav className="nav">
            <button className={activeTab === 'scanner' ? 'active' : ''} onClick={() => setActiveTab('scanner')}>
              <Search size={18} />Scanner
            </button>
            <button className={activeTab === 'analysis' ? 'active' : ''} onClick={() => setActiveTab('analysis')}>
              <BarChart3 size={18} />Analysis
            </button>
            <button className={activeTab === 'cycles' ? 'active' : ''} onClick={() => setActiveTab('cycles')}>
              <History size={18} />Trade Cycles
            </button>
          </nav>
          <div className="user-section">
            <div className="user-info">
              <User size={18} />
              <span>{user?.email}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'scanner' && (
          <div className="scanner-page">
            <div className="scanner-header">
              <div className="scanner-title-section">
                <h2 className="page-title"><Search size={32} />Market Scanner</h2>
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
              <button className={`filter-btn ${filterSignal === 'ALL' ? 'active' : ''}`} onClick={() => setFilterSignal('ALL')}>
                All ({scannerData.length})
              </button>
              <button className={`filter-btn holdings ${filterSignal === 'HOLDINGS' ? 'active' : ''}`} onClick={() => setFilterSignal('HOLDINGS')}>
                Holdings ({scannerData.filter(s => s.has_open_cycle).length})
              </button>
              <button className={`filter-btn buy ${filterSignal === 'BUY' ? 'active' : ''}`} onClick={() => setFilterSignal('BUY')}>
                Buy ({scannerData.filter(s => s.signal === 'BUY' && !s.has_open_cycle).length})
              </button>
              <button className={`filter-btn sell ${filterSignal === 'SELL' ? 'active' : ''}`} onClick={() => setFilterSignal('SELL')}>
                Sell ({scannerData.filter(s => s.signal === 'SELL').length})
              </button>
              <button className={`filter-btn neutral ${filterSignal === 'NEUTRAL' ? 'active' : ''}`} onClick={() => setFilterSignal('NEUTRAL')}>
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
                        <div className="cycle-row"><span>Buy Price:</span><strong>NPR {item.open_cycle.buy_price.toFixed(2)}</strong></div>
                        <div className="cycle-row"><span>Highest:</span><strong>NPR {item.open_cycle.highest_price.toFixed(2)}</strong></div>
                        <div className="cycle-row"><span>TSL (5%):</span><strong>NPR {item.open_cycle.tsl_price.toFixed(2)}</strong></div>
                        <div className="cycle-row"><span>Unrealized P/L:</span><strong className={item.open_cycle.unrealized_pnl >= 0 ? 'profit' : 'loss'}>{item.open_cycle.unrealized_pnl.toFixed(2)}%</strong></div>
                      </div>
                    </div>
                  )}

                  <div className="scanner-card-footer">
                    <button className="detail-btn" onClick={() => { setSelectedSymbol(item.symbol); setActiveTab('analysis'); }}>
                      View Details
                    </button>
                    
                    {!item.has_open_cycle && item.signal === 'BUY' && (
                      <button className="trade-btn buy" onClick={() => executeTrade(item.symbol, 'BUY', item.date, item.current_price, item.current_rsi)}>
                        Execute Buy
                      </button>
                    )}
                    
                    {item.has_open_cycle && item.signal === 'SELL' && (
                      <button className="trade-btn sell" onClick={() => executeTrade(item.symbol, 'SELL', item.date, item.current_price, item.current_rsi)}>
                        Auto Sell
                      </button>
                    )}
                    
                    {item.has_open_cycle && (
                      <button className="trade-btn manual-sell" onClick={() => openManualSellModal(item)}>
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
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="analysis-page">
            <div className="analysis-layout">
              <aside className="controls-panel">
                <div className="panel-section">
                  <h3 className="panel-title"><Database size={20} />Select Symbol</h3>
                  <div className="symbol-selector">
                    <select value={selectedSymbol} onChange={(e) => setSelectedSymbol(e.target.value)} className="symbol-select">
                      {symbols.map(symbol => (<option key={symbol} value={symbol}>{symbol}</option>))}
                    </select>
                  </div>
                  
                  {statistics && (
                    <div className="upload-info">
                      <div className="info-row"><span>Symbol:</span><strong>{selectedSymbol}</strong></div>
                      <div className="info-row"><span>Current Price:</span><strong>NPR {statistics.current_price?.toFixed(2)}</strong></div>
                      <div className="info-row"><span>Date Range:</span><strong>{statistics.date_range?.start} to {statistics.date_range?.end}</strong></div>
                    </div>
                  )}
                </div>

                <div className="panel-section">
                  <h3 className="panel-title"><Settings size={20} />RSI Settings</h3>
                  
                  <div className="setting-group">
                    <label>RSI Period</label>
                    <input type="number" value={rsiPeriod} onChange={(e) => setRsiPeriod(parseInt(e.target.value))} min="2" max="100" className="setting-input" />
                    <span className="setting-hint">Default: 14 days</span>
                  </div>

                  <div className="setting-group">
                    <label>Upper Threshold (Buy)</label>
                    <input type="number" value={upperThreshold} onChange={(e) => setUpperThreshold(parseInt(e.target.value))} min="50" max="100" className="setting-input" />
                    <div className="threshold-bar">
                      <div className="threshold-fill buy" style={{width: `${upperThreshold}%`}}></div>
                    </div>
                  </div>

                  <div className="setting-group">
                    <label>Lower Threshold (Sell)</label>
                    <input type="number" value={lowerThreshold} onChange={(e) => setLowerThreshold(parseInt(e.target.value))} min="0" max="50" className="setting-input" />
                    <div className="threshold-bar">
                      <div className="threshold-fill sell" style={{width: `${lowerThreshold}%`}}></div>
                    </div>
                  </div>

                  <button className="analyze-button" onClick={analyzeData} disabled={!selectedSymbol || loading}>
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
                      <div className="stat-item"><span>Total Signals</span><strong>{statistics.total_signals}</strong></div>
                      <div className="stat-item buy"><span>Buy Signals</span><strong>{statistics.buy_signals}</strong></div>
                      <div className="stat-item sell"><span>Sell Signals</span><strong>{statistics.sell_signals}</strong></div>
                      <div className="stat-item"><span>Current RSI</span><strong>{statistics.current_rsi?.toFixed(2) || 'N/A'}</strong></div>
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
                          <Tooltip contentStyle={{ backgroundColor: '#0f1419', border: '1px solid #1e293b', borderRadius: '8px' }} />
                          <Legend />
                          <Line type="monotone" dataKey="close" stroke="#10b981" strokeWidth={2} dot={false} name="Close Price" />
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
                          <Tooltip contentStyle={{ backgroundColor: '#0f1419', border: '1px solid #1e293b', borderRadius: '8px' }} />
                          <Legend />
                          <ReferenceLine y={upperThreshold} stroke="#10b981" strokeDasharray="3 3" label="Buy Zone" />
                          <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="3 3" label="Neutral" />
                          <ReferenceLine y={lowerThreshold} stroke="#ef4444" strokeDasharray="3 3" label="Sell Zone" />
                          <Line type="monotone" dataKey="rsi" stroke="#3b82f6" strokeWidth={2} dot={false} name="RSI" />
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
          </div>
        )}

        {activeTab === 'cycles' && (
          <div className="cycles-page">
            <div className="cycles-header">
              <h2 className="page-title"><History size={32} />Trade Cycles History</h2>
              <button className="refresh-btn" onClick={() => fetchCycles()} disabled={cyclesLoading}>
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
                          <td><span className={`status-badge ${cycle.status.toLowerCase()}`}>{cycle.status}</span></td>
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
                              <span className={cycle.sell_reason === 'AUTOMATIC' ? 'reason-badge automatic' : 'reason-badge manual'}>
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
          </div>
        )}

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

          .reason-badge {
            padding: 0.3rem 0.6rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
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

          .user-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          }

          .user-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: rgba(30, 41, 59, 0.5);
            border-radius: 8px;
            color: #94a3b8;
            font-size: 0.9rem;
          }

          .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-family: inherit;
          transition: all 0.3s ease;
          }

          .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-2px);
          }

          .filter-btn.holdings.active {
          background: rgba(59, 130, 246, 0.15);
          border-color: #3b82f6;
           color: #3b82f6;
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
            display: flex;
            align-items: center;
            gap: 0.5rem;
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
  
          /* Scanner Page Styles */
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
  
          .summary-card {
            background: rgba(15, 20, 25, 0.6);
            border: 1px solid #1e293b;
            border-radius: 12px;
            padding: 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            transition: all 0.3s ease;
          }
  
          .summary-card:hover {
            transform: translateY(-2px);
            border-color: #10b981;
          }
  
          .summary-card.buy {
            border-color: rgba(16, 185, 129, 0.3);
            background: rgba(16, 185, 129, 0.05);
          }
  
          .summary-card.sell {
            border-color: rgba(239, 68, 68, 0.3);
            background: rgba(239, 68, 68, 0.05);
          }
  
          .summary-card.neutral {
            border-color: rgba(100, 116, 139, 0.3);
            background: rgba(100, 116, 139, 0.05);
          }
  
          .summary-card.active {
            border-color: rgba(59, 130, 246, 0.3);
            background: rgba(59, 130, 246, 0.05);
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
            font-size: 0.85rem;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
  
          .scanner-filters {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
          }
  
          .filter-btn {
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid #1e293b;
            color: #94a3b8;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-family: inherit;
            transition: all 0.3s ease;
          }
  
          .filter-btn:hover {
            border-color: #10b981;
            color: #10b981;
          }
  
          .filter-btn.active {
            background: rgba(16, 185, 129, 0.15);
            border-color: #10b981;
            color: #10b981;
          }
  
          .filter-btn.buy.active {
            background: rgba(16, 185, 129, 0.15);
            border-color: #10b981;
            color: #10b981;
          }
  
          .filter-btn.sell.active {
            background: rgba(239, 68, 68, 0.15);
            border-color: #ef4444;
            color: #ef4444;
          }
  
          .filter-btn.neutral.active {
            background: rgba(100, 116, 139, 0.15);
            border-color: #64748b;
            color: #94a3b8;
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
            font-size: 0.85rem;
          }
  
          .cycle-row span {
            color: #94a3b8;
          }
  
          .cycle-row strong {
            color: #f1f5f9;
          }
  
          .cycle-row .profit {
            color: #10b981;
          }
  
          .cycle-row .loss {
            color: #ef4444;
          }
  
          .scanner-card-footer {
            display: flex;
            gap: 0.75rem;
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
  
          .trade-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }
  
          /* Cycles Page Styles */
          .cycles-page {
            padding: 1rem 0;
          }
  
          .cycles-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
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
  
          /* Analysis Page - Keep existing styles */
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
  
          @media (max-width: 1200px) {
            .analysis-layout {
              grid-template-columns: 1fr;
            }
  
            .scanner-grid {
              grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            }
          }



/* Modal Styles */
.modal-overlay {
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

.sell-info-row span {
  color: #94a3b8;
  font-size: 0.9rem;
}

.sell-info-row strong {
  color: #f1f5f9;
  font-size: 1rem;
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
}

/* Manual Sell Button */
.trade-btn.manual-sell {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.trade-btn.manual-sell:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* Reason Badges - AUTOMATIC in GREEN, Manual in RED */
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
  color: #ef4444;
}
            
        `}</style>

      </main>
    </div>
  );
}



export default App;