const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}

export function getFitnessEntry(date) {
  return apiFetch(`/api/fitness/${date}`);
}

export function saveFitnessEntry(date, data) {
  return apiFetch(`/api/fitness/${date}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function getAllFitnessEntries() {
  return apiFetch('/api/fitness');
}

export function getFoodLog(date) {
  return apiFetch(`/api/food/${date}`);
}

export function saveFoodLog(date, data) {
  return apiFetch(`/api/food/${date}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function getAllFoodLogs() {
  return apiFetch('/api/food');
}

export function deleteFoodLog(date) {
  return apiFetch(`/api/food/${date}`, { method: 'DELETE' });
}
