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
//   return (
//     <div className="app">
//       <div className="background-grid"></div>
      
//       {/* Notification */}
//       {showNotification && notification && (
//         <div className={`notification ${notification.type} ${showNotification ? 'show' : ''}`}>
//           <Bell size={18} />
//           <span>{notification.message}</span>
//         </div>
//       )}

//       {/* Header */}
//       <header className="header">
//         <div className="header-content">
//           <div className="logo">
//             <Activity size={32} strokeWidth={2.5} />
//             <h1>MARKET<span>PULSE</span></h1>
//           </div>
//           <nav className="nav">
//             <button 
//               className={activeTab === 'scanner' ? 'active' : ''}
//               onClick={() => setActiveTab('scanner')}
//             >
//               <Search size={18} />
//               Scanner
//             </button>
//             <button 
//               className={activeTab === 'analysis' ? 'active' : ''}
//               onClick={() => setActiveTab('analysis')}
//             >
//               <BarChart3 size={18} />
//               Analysis
//             </button>
//             <button 
//               className={activeTab === 'cycles' ? 'active' : ''}
//               onClick={() => setActiveTab('cycles')}
//             >
//               <History size={18} />
//               Trade Cycles
//             </button>
//           </nav>
//           <div className="user-section">
//             <div className="user-info">
//               <User size={18} />
//               <span>{user?.email}</span>
//             </div>
//             <button className="logout-btn" onClick={handleLogout}>
//               <LogOut size={18} />
//               Logout
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="main-content">
//         {/* SCANNER TAB */}
//         {activeTab === 'scanner' && (
//           <div className="scanner-page">
//             <div className="scanner-header">
//               <div className="scanner-title-section">
//                 <h2 className="page-title">
//                   <Search size={32} />
//                   Market Scanner
//                 </h2>
//                 <p className="page-subtitle">Real-time signals for all available symbols</p>
//               </div>
              
//               <div className="scanner-actions">
//                 <button 
//                   className="refresh-btn"
//                   onClick={fetchScanner}
//                   disabled={scannerLoading}
//                 >
//                   {scannerLoading ? 'Scanning...' : 'Refresh Scanner'}
//                 </button>
//               </div>
//             </div>

//             {scannerSummary && (
//               <div className="summary-cards">
//                 <div className="summary-card">
//                   <div className="summary-icon">📊</div>
//                   <div className="summary-content">
//                     <div className="summary-value">{scannerSummary.total_symbols}</div>
//                     <div className="summary-label">Total Symbols</div>
//                   </div>
//                 </div>

//                 <div className="summary-card buy">
//                   <div className="summary-icon">🔼</div>
//                   <div className="summary-content">
//                     <div className="summary-value">{scannerSummary.buy_signals}</div>
//                     <div className="summary-label">Buy Signals</div>
//                   </div>
//                 </div>

//                 <div className="summary-card sell">
//                   <div className="summary-icon">🔽</div>
//                   <div className="summary-content">
//                     <div className="summary-value">{scannerSummary.sell_signals}</div>
//                     <div className="summary-label">Sell Signals</div>
//                   </div>
//                 </div>

//                 <div className="summary-card neutral">
//                   <div className="summary-icon">➖</div>
//                   <div className="summary-content">
//                     <div className="summary-value">{scannerSummary.neutral_signals + (scannerSummary.hold_signals || 0)}</div>
//                     <div className="summary-label">Neutral</div>
//                   </div>
//                 </div>

//                 <div className="summary-card active">
//                   <div className="summary-icon">📈</div>
//                   <div className="summary-content">
//                     <div className="summary-value">{scannerSummary.open_positions}</div>
//                     <div className="summary-label">Holdings</div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="scanner-filters">
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

//             <div className="scanner-grid">
//               {filteredScannerData.map((item, index) => (
//                 <div key={index} className={`scanner-card ${item.signal_class}`}>
//                   <div className="scanner-card-header">
//                     <div className="symbol-name">{item.symbol}</div>
//                     <div className={`signal-badge ${item.signal_class}`}>
//                       {item.signal}
//                       {item.sell_reason && ` (${item.sell_reason})`}
//                     </div>
//                   </div>

//                   <div className="scanner-card-body">
//                     <div className="price-section">
//                       <div className="price-label">Current Price</div>
//                       <div className="price-value">NPR {item.current_price.toFixed(2)}</div>
//                     </div>

//                     <div className="rsi-section">
//                       <div className="rsi-label">RSI</div>
//                       <div className={`rsi-value ${item.signal_class}`}>
//                         {item.current_rsi}
//                       </div>
//                     </div>
//                   </div>

//                   {item.has_open_cycle && item.open_cycle && (
//                     <div className="open-cycle-info">
//                       <div className="cycle-badge">
//                         📍 Cycle #{item.open_cycle.cycle_number} Open
//                       </div>
//                       <div className="cycle-details">
//                         <div className="cycle-row">
//                           <span>Buy Price:</span>
//                           <strong>NPR {item.open_cycle.buy_price.toFixed(2)}</strong>
//                         </div>
//                         <div className="cycle-row">
//                           <span>Highest:</span>
//                           <strong>NPR {item.open_cycle.highest_price.toFixed(2)}</strong>
//                         </div>
//                         <div className="cycle-row">
//                           <span>TSL (5%):</span>
//                           <strong>NPR {item.open_cycle.tsl_price.toFixed(2)}</strong>
//                         </div>
//                         <div className="cycle-row">
//                           <span>Unrealized P/L:</span>
//                           <strong className={item.open_cycle.unrealized_pnl >= 0 ? 'profit' : 'loss'}>
//                             {item.open_cycle.unrealized_pnl.toFixed(2)}%
//                           </strong>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   <div className="scanner-card-footer">
//                     <button 
//                       className="detail-btn"
//                       onClick={() => {
//                         setSelectedSymbol(item.symbol);
//                         setActiveTab('analysis');
//                       }}
//                     >
//                       View Details
//                     </button>
//                     {!item.has_open_cycle && item.signal === 'BUY' && (
//                       <button 
//                         className="trade-btn buy"
//                         onClick={() => executeTrade(
//                           item.symbol, 'BUY', item.date, 
//                           item.current_price, item.current_rsi
//                         )}
//                       >
//                         Execute Buy
//                       </button>
//                     )}
//                     {item.has_open_cycle && item.signal === 'SELL' && (
//                       <button 
//                         className="trade-btn sell"
//                         onClick={() => executeTrade(
//                           item.symbol, 'SELL', item.date,
//                           item.current_price, item.current_rsi
//                         )}
//                       >
//                         Execute Sell
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {filteredScannerData.length === 0 && (
//               <div className="empty-state">
//                 <Search size={64} />
//                 <h3>No symbols found</h3>
//                 <p>Try changing the filter or refresh the scanner</p>
//               </div>
//             )}
//           </div>
//         )}

//         {/* ANALYSIS TAB - (keeping existing code, just added auth check) */}
//         {activeTab === 'analysis' && (
//           <div className="analysis-page">
//             {/* Your existing analysis page code */}
//           </div>
//         )}

//         {/* CYCLES TAB - (keeping existing code, just added auth check) */}
//         {activeTab === 'cycles' && (
//           <div className="cycles-page">
//             {/* Your existing cycles page code */}
//           </div>
//         )}
//       </main>

//       <style jsx>{`
//         /* Add to your existing styles */
        
//         .user-section {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//         }

//         .user-info {
//           display: flex;
//           align-items: center;
//           gap: 0.5rem;
//           padding: 0.5rem 1rem;
//           background: rgba(30, 41, 59, 0.5);
//           border-radius: 8px;
//           color: #94a3b8;
//           font-size: 0.9rem;
//         }

//         .logout-btn {
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
//         }

//         .logout-btn:hover {
//           background: rgba(239, 68, 68, 0.2);
//           transform: translateY(-2px);
//         }

//         .filter-btn.holdings.active {
//           background: rgba(59, 130, 246, 0.15);
//           border-color: #3b82f6;
//           color: #3b82f6;
//         }

//         /* Keep all your existing styles */
//       `}</style>
//     </div>
//   );
// }

// export default App;


// This is just a refrence  //

import React, { useState } from 'react';
import { Activity, Bell } from 'lucide-react';
import { authRequest } from '../utils/api';

export default function Login({ onAuthSuccess, showNotificationMessage, showNotification, notification }) {
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const response = await authRequest(authMode, email, password);
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        onAuthSuccess(data.user);
        setEmail('');
        setPassword('');
        showNotificationMessage(`Welcome ${data.user.email}!`, 'success');
      } else {
        showNotificationMessage(data.error, 'error');
      }
    } catch {
      showNotificationMessage('Connection error. Please try again.', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="background-grid"></div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <Activity size={48} strokeWidth={2.5} className="login-icon" />
            <h1>MARKET<span>PULSE</span></h1>
            <p>Smart Trading Made Simple</p>
          </div>

          <div className="auth-tabs">
            <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Login</button>
            <button className={authMode === 'signup' ? 'active' : ''} onClick={() => setAuthMode('signup')}>Sign Up</button>
          </div>

          <form onSubmit={handleAuth} className="login-form">
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="login-button" disabled={authLoading}>
              {authLoading ? 'Please wait...' : authMode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
                {authMode === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {showNotification && notification && (
        <div className={`notification ${notification.type} show`}>
          <Bell size={18} />
          <span>{notification.message}</span>
        </div>
      )}

      <style>{`
        .login-container {
          position: relative; z-index: 1; min-height: 100vh;
          display: flex; align-items: center; justify-content: center; padding: 2rem;
        }
        .login-card {
          background: rgba(15,20,25,0.9); border: 1px solid #1e293b; border-radius: 24px;
          padding: 3rem; max-width: 450px; width: 100%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .login-header { text-align: center; margin-bottom: 2rem; }
        .login-icon { color: #10b981; filter: drop-shadow(0 0 12px rgba(16,185,129,0.5)); margin-bottom: 1rem; }
        .login-header h1 { font-size: 2rem; font-weight: 900; color: #f1f5f9; margin-bottom: 0.5rem; }
        .login-header h1 span { color: #10b981; }
        .login-header p { color: #94a3b8; font-size: 0.95rem; }
        .auth-tabs { display: flex; gap: 0.5rem; margin-bottom: 2rem; background: rgba(30,41,59,0.3); padding: 0.5rem; border-radius: 12px; }
        .auth-tabs button { flex: 1; padding: 0.75rem; background: none; border: none; color: #94a3b8; font-weight: 600; font-family: inherit; cursor: pointer; border-radius: 8px; transition: all 0.3s ease; }
        .auth-tabs button.active { background: linear-gradient(135deg,#10b981,#059669); color: white; }
        .login-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { color: #cbd5e1; font-size: 0.9rem; font-weight: 600; }
        .form-group input { padding: 1rem; background: rgba(30,41,59,0.5); border: 1px solid #1e293b; border-radius: 10px; color: #f1f5f9; font-family: inherit; font-size: 1rem; transition: all 0.3s ease; }
        .form-group input:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
        .form-group input::placeholder { color: #64748b; }
        .login-button { padding: 1rem; background: linear-gradient(135deg,#10b981,#059669); color: white; border: none; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; font-family: inherit; transition: all 0.3s ease; margin-top: 0.5rem; }
        .login-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16,185,129,0.4); }
        .login-button:disabled { opacity: 0.5; cursor: not-allowed; }
        .login-footer { margin-top: 2rem; text-align: center; }
        .login-footer p { color: #94a3b8; font-size: 0.9rem; }
        .login-footer button { background: none; border: none; color: #10b981; font-weight: 600; cursor: pointer; font-family: inherit; text-decoration: underline; }
      `}</style>
    </div>
  );
}