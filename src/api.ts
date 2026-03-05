const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API error: ${response.status}`);
  }
  return response.json();
}

// ── Products ─────────────────────────────────────────────────────────────────
export const getProducts = () => fetchAPI('/products');
export const getProduct = (id: string | number) => fetchAPI(`/products/${id}`);
export const createProduct = (data: any) => fetchAPI('/products', { method: 'POST', body: JSON.stringify(data) });
export const updateProduct = (id: string | number, data: any) => fetchAPI(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProduct = (id: string | number) => fetchAPI(`/products/${id}`, { method: 'DELETE' });

// ── Categories ───────────────────────────────────────────────────────────────
export const getCategories = () => fetchAPI('/categories');
export const getCategory = (id: string | number) => fetchAPI(`/categories/${id}`);
export const createCategory = (data: any) => fetchAPI('/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateCategory = (id: string | number, data: any) => fetchAPI(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCategory = (id: string | number) => fetchAPI(`/categories/${id}`, { method: 'DELETE' });

// ── Orders ───────────────────────────────────────────────────────────────────
export const getOrders = () => fetchAPI('/orders');
export const getOrder = (id: string | number) => fetchAPI(`/orders/${id}`);
export const createOrder = (data: any) => fetchAPI('/orders', { method: 'POST', body: JSON.stringify(data) });
export const updateOrder = (id: string | number, data: any) => fetchAPI(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteOrder = (id: string | number) => fetchAPI(`/orders/${id}`, { method: 'DELETE' });

// ── Users ────────────────────────────────────────────────────────────────────
export const login = (data: any) => fetchAPI('/login', { method: 'POST', body: JSON.stringify(data) });
export const register = (data: any) => fetchAPI('/register', { method: 'POST', body: JSON.stringify(data) });
export const getUsers = () => fetchAPI('/users');
export const getUser = (id: string | number) => fetchAPI(`/users/${id}`);
export const createUser = (data: any) => fetchAPI('/users', { method: 'POST', body: JSON.stringify(data) });
export const updateUser = (id: string | number, data: any) => fetchAPI(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteUser = (id: string | number) => fetchAPI(`/users/${id}`, { method: 'DELETE' });

// ── Bakery Flavors ───────────────────────────────────────────────────────────
export const getBakeryFlavors = () => fetchAPI('/bakery-flavors');
export const getBakeryFlavor = (id: string | number) => fetchAPI(`/bakery-flavors/${id}`);
export const createBakeryFlavor = (data: any) => fetchAPI('/bakery-flavors', { method: 'POST', body: JSON.stringify(data) });
export const updateBakeryFlavor = (id: string | number, data: any) => fetchAPI(`/bakery-flavors/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBakeryFlavor = (id: string | number) => fetchAPI(`/bakery-flavors/${id}`, { method: 'DELETE' });

// ── Bread Types ──────────────────────────────────────────────────────────────
export const getBreadTypes = () => fetchAPI('/bread-types');
export const getBreadType = (id: string | number) => fetchAPI(`/bread-types/${id}`);
export const createBreadType = (data: any) => fetchAPI('/bread-types', { method: 'POST', body: JSON.stringify(data) });
export const updateBreadType = (id: string | number, data: any) => fetchAPI(`/bread-types/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBreadType = (id: string | number) => fetchAPI(`/bread-types/${id}`, { method: 'DELETE' });
