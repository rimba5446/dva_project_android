import axios from 'axios';

function getApiUrl() {
  return localStorage.getItem('server_url') || 'http://192.168.1.7:5000/api';
}

export const login = (username, password) =>
  axios.post(`${getApiUrl()}/login`, { username, password });

export const getCategories = () =>
  axios.get(`${getApiUrl()}/categories`);

export const getMenus = (categoryId, id_cabang) => {
  const params = { id_cabang };
  if (categoryId) params.category = categoryId;
  return axios.get(`${getApiUrl()}/menus`, { params });
};

export const createOrder = (orderData) =>
  axios.post(`${getApiUrl()}/orders`, orderData);

export const getOrders = (id_cabang) =>
  axios.get(`${getApiUrl()}/orders`, { params: { id_cabang } });

export const getOrderDetail = (orderId) =>
  axios.get(`${getApiUrl()}/orders/${orderId}`);

export const getLaporan = (start, end, type, id_cabang) =>
  axios.get(`${getApiUrl()}/laporan`, { params: { start, end, type, id_cabang } });

export const getSettings = () =>
  axios.get(`${getApiUrl()}/settings`);

export async function bayarOrder(orderId, data) {
  return fetch(`${getApiUrl()}/orders/${orderId}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.json());
}

export async function hapusOrder(orderId) {
  return fetch(`${getApiUrl()}/orders/${orderId}`, {
    method: 'DELETE' }).then(res => res.json());
}

export async function getQris({ order_id, gross_amount, nama_pembeli }) {
  return fetch(`${getApiUrl()}/midtrans/qris`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id, gross_amount, nama_pembeli }),
  }).then(res => res.json());
}
