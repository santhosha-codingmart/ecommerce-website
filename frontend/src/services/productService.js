import API from './api';

// Get products (paginated)
export const getAllProducts = async (page = 0, size = 10) => {
    const response = await API.get(`/products?page=${page}&size=${size}`);
    return response.data;
};

// Get products by category (paginated)
export const getProductsByCategory = async (categoryId, page = 0, size = 10) => {
    const response = await API.get(`/products/category/${categoryId}?page=${page}&size=${size}`);
    return response.data;
};

// Elasticsearch smart search (handles "phones under 5000 rupees")
export const searchProducts = async (keyword, page = 0, size = 10) => {
    const response = await API.get(`/products/search?q=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
    return response.data;
};

// Get categories (paginated, 5 per page)
export const getCategories = async (page = 0, size = 5) => {
    const response = await API.get(`/categories?page=${page}&size=${size}`);
    return response.data;
};
