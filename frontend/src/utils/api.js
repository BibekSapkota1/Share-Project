const API_URL = 'http://localhost:8080/api';
//const API_URL = 'https://analysisproject.onrender.com/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': localStorage.getItem('token') || ''
});

// ────────────────────────────────────────────────────────────────────────────
// Auth APIs
// ────────────────────────────────────────────────────────────────────────────
export const verifyTokenAPI = (token) => {
  return fetch(`${API_URL}/auth/verify`, {
    headers: { 'Authorization': token }
  });
};

export const loginAPI = (email, password) => {
  return fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
};

export const signupAPI = (email, password) => {
  return fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
};

// ────────────────────────────────────────────────────────────────────────────
// Data Fetching APIs
// ────────────────────────────────────────────────────────────────────────────
export const fetchSymbolsAPI = () => {
  return fetch(`${API_URL}/symbols`);
};

export const fetchScannerAPI = () => {
  return fetch(`${API_URL}/scanner`, { 
    headers: getAuthHeaders() 
  });
};

export const fetchCyclesAPI = (symbol = null) => {
  const url = symbol ? `${API_URL}/cycles/${symbol}` : `${API_URL}/cycles`;
  return fetch(url, { 
    headers: getAuthHeaders() 
  });
};

export const analyzeDataAPI = (symbol, rsiPeriod, upperThreshold, lowerThreshold) => {
  return fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      symbol,
      rsi_period: rsiPeriod,
      upper_threshold: upperThreshold,
      lower_threshold: lowerThreshold
    })
  });
};

// ────────────────────────────────────────────────────────────────────────────
// Trade Execution APIs
// ────────────────────────────────────────────────────────────────────────────
export const executeTradeAPI = (symbol, action, date, price, rsi) => {
  return fetch(`${API_URL}/trade`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ symbol, action, date, price, rsi })
  });
};

export const executeManualSellAPI = (symbol, date, price, rsi, reason) => {
  return fetch(`${API_URL}/trade/manual-sell`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ symbol, date, price, rsi, reason })
  });
};

export { API_URL };