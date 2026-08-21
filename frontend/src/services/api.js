import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('voice_iq_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const requestJson = async (path, options = {}) => {
    try {
        const response = await api.request({ url: path, ...options });
        return response.data;
    } catch (error) {
        const detail = error.response?.data?.detail || error.response?.data?.error;
        error.message = detail || error.message || 'Request failed.';
        throw error;
    }
};

export const searchProducts = async (query, type = 'text', page = 1) => {
    return requestJson('/search', {
        method: 'POST',
        data: { query, search_type: type, page },
    });
};

export const searchByUrl = async (url) => {
    return requestJson('/search/url', {
        method: 'POST',
        data: { query: url, search_type: 'url' },
    });
};

export const getSearchSuggestions = async (query) => {
    return requestJson(`/search/suggestions?q=${encodeURIComponent(query)}`);
};

export const resolveProductUrl = async (providerProductToken, merchant) => {
    return requestJson('/search/resolve-product-url', {
        method: 'POST',
        data: {
            provider_product_token: providerProductToken,
            merchant,
        },
    });
};

export const getProductComparison = async (productId, priority = 'balanced') => {
    return requestJson(`/products/${productId}?priority=${priority}`);
};

export const searchByImage = async (formData) => {
    return requestJson('/search/image', {
        method: 'POST',
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export const getNotifications = async () => {
    return requestJson('/notifications');
};

export const getSearchHistory = async () => {
    return requestJson('/history');
};

export const getLikedProductIds = async () => requestJson('/activity/likes');
export const addLikedProduct = async (productId) => requestJson(`/activity/likes/${encodeURIComponent(productId)}`, { method: 'POST' });
export const removeLikedProduct = async (productId) => requestJson(`/activity/likes/${encodeURIComponent(productId)}`, { method: 'DELETE' });
export const recordViewedProduct = async (productId) => requestJson(`/activity/views/${encodeURIComponent(productId)}`, { method: 'POST' });
export const getViewedProductIds = async () => requestJson('/activity/views');

export const getTrendingProducts = async () => {
    return requestJson('/trending');
};

export const getAdminMetrics = async () => {
    return requestJson('/admin/metrics');
};
