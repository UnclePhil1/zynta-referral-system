const API_BASE_URL = "https://zynta-referral-system.onrender.com"; 

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.href = '/auth.html';
            return;
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

async function getProfile() {
    return fetchWithAuth(`${API_BASE_URL}/api/profile`); 
}

async function getAllUsers() {
    return fetchWithAuth(`${API_BASE_URL}/api/all-users`);
}

async function registerUser(data) {
    return fetchWithAuth(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

async function loginUser(data) {
    return fetch(`${API_BASE_URL}/api/login`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}