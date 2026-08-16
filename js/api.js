const API_URL = 'http://localhost:3000';

window.apiRequest = async function (endpoint, options = {}) {
    const token = localStorage.getItem('accessToken');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw new Error(
            Array.isArray(data?.message)
                ? data.message.join(', ')
                : data?.message || 'خطایی در ارتباط با سرور رخ داد.'
        );
    }

    return data;
};