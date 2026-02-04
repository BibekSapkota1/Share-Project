const API_URL = 'http://localhost:8080/api';

// ── helpers ─────────────────────────────────────────────────────────────────

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token || '',
  };
};

// ── auth ────────────────────────────────────────────────────────────────────

export const verifyTokenAPI = (token) =>
  fetch(`${API_URL}/auth/verify`, { headers: { Authorization: token } });

export const authRequest = (mode, email, password) =>
  fetch(`${API_URL}/auth/${mode === 'login' ? 'login' : 'signup'}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

// ── symbols & scanner ───────────────────────────────────────────────────────

export const fetchSymbolsAPI = () => fetch(`${API_URL}/symbols`);

export const fetchScannerAPI = () =>
  fetch(`${API_URL}/scanner`, { headers: getAuthHeaders() });

// ── analysis ────────────────────────────────────────────────────────────────

export const analyzeAPI = (symbol, rsiPeriod, upperThreshold, lowerThreshold) =>
  fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ symbol, rsi_period: rsiPeriod, upper_threshold: upperThreshold, lower_threshold: lowerThreshold }),
  });

// ── cycles ──────────────────────────────────────────────────────────────────

export const fetchCyclesAPI = (symbol = null) =>
  fetch(symbol ? `${API_URL}/cycles/${symbol}` : `${API_URL}/cycles`, {
    headers: getAuthHeaders(),
  });

// ── trade ───────────────────────────────────────────────────────────────────

export const executeTradeAPI = (symbol, action, date, price, rsi) =>
  fetch(`${API_URL}/trade`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ symbol, action, date, price, rsi }),
  });