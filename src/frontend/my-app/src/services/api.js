const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
	const response = await fetch(`${API_URL}${path}`, options);
	if (!response.ok) throw new Error(`API request failed: ${response.status}`);
	return response.json();
}

export const api = {
	getAlerts: () => request('/alerts'),
	getLatestSystemStatus: () => request('/system-status/latest'),
	getHealth: () => request('/health'),
};

export { API_URL };
