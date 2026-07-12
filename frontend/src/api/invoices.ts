import axios from 'axios';
import { clearToken, getToken } from '@/api/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ranjith-anna.onrender.com/api/v1',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const fetchInvoices = async ({ pageParam = 0 }: { pageParam?: number } = {}) => {
  const { data } = await api.get('/invoices/', {
    params: {
      limit: 50,
      offset: pageParam
    }
  });
  return data;
};

export const fetchDashboardSummary = async () => {
  const { data } = await api.get('/invoices/summary');
  return data;
};

export const fetchLedgers = async () => {
  const { data } = await api.get('/invoices/ledgers');
  return data;
};

export const updateInvoice = async (id: string | number, payload: {
  status?: string;
  approval_status?: string;
  invoice_type?: string | null;
  notes?: string | null;
  ledger_code?: string | null;
  document_type?: string | null;
}) => {
  const { data } = await api.put(`/invoices/${id}`, payload);
  return data;
};

export const triggerSync = async () => {
  const { data } = await api.post('/invoices/sync');
  return data;
};
