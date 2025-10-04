import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { API_BASE_URL } from '../api/client';
import { useApi } from '../hooks/useApi';
import { useAuthContext } from '../context/AuthContext';
import type { Product, Sale } from '../types';
import { formatCurrency, formatDate, formatNumber } from '../utils/format';

interface SalesSummary {
  range: { from?: string; to?: string };
  totals: {
    totalSales: number;
    unitsSold: number;
    revenue: number;
    profit: number;
  };
  breakdown: Array<{
    productName: string;
    unitsSold: number;
    revenue: number;
    profit: number;
  }>;
}

const summaryOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const SalesPage = () => {
  const api = useApi();
  const { token, hasRole } = useAuthContext();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ from: '', to: '' });
  const [period, setPeriod] = useState('daily');
  const [form, setForm] = useState({ productId: '', quantity: 1, saleDate: dayjs().format('YYYY-MM-DD') });
  const [customerName, setCustomerName] = useState('');

  const { data: products } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => api.get<Product[]>('/api/products'),
  });

  const { data: sales, isLoading } = useQuery<Sale[]>({
    queryKey: ['sales', filters],
    queryFn: () => api.get<Sale[]>('/api/sales', filters),
  });

  const { data: summary } = useQuery<SalesSummary>({
    queryKey: ['sales-summary', period],
    queryFn: () => api.get<SalesSummary>('/api/sales/summary', { period }),
  });

  const createSaleMutation = useMutation({
    mutationFn: (payload: { productId: number; quantity: number; saleDate: string; customerName?: string }) =>
      api.post('/api/sales', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setForm({ productId: '', quantity: 1, saleDate: dayjs().format('YYYY-MM-DD') });
      setCustomerName('');
    },
  });

  const handleFilterChange = (key: 'from' | 'to', value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.productId) return;
    createSaleMutation.mutate({
      productId: Number(form.productId),
      quantity: Number(form.quantity),
      saleDate: dayjs(form.saleDate).toISOString(),
      customerName: customerName || undefined,
    });
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!token) {
      alert('You must be signed in to export data.');
      return;
    }
    const params = new URLSearchParams();
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    params.append('format', format);

    const response = await fetch(`${API_BASE_URL}/api/sales/export?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      alert('Failed to export sales');
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = response.headers.get('Content-Disposition')?.split('filename="')[1]?.replace('"', '') || `sales.${format}`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const totals = useMemo(() => {
    if (!sales) return { revenue: 0, profit: 0, units: 0 };
    return sales.reduce(
      (acc, sale) => ({
        revenue: acc.revenue + sale.revenue,
        profit: acc.profit + sale.profit,
        units: acc.units + sale.quantity,
      }),
      { revenue: 0, profit: 0, units: 0 }
    );
  }, [sales]);

  return (
    <div className="stack">
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Sales Activity</h2>
            <p className="subtitle">Review transactions and log new sales.</p>
          </div>
          <div className="button-row">
            <button type="button" className="secondary-button" onClick={() => handleExport('csv')}>
              Export CSV
            </button>
            <button type="button" className="secondary-button" onClick={() => handleExport('pdf')}>
              Export PDF
            </button>
          </div>
        </div>

        <div className="filters">
          <label>
            From
            <input type="date" value={filters.from} onChange={(e) => handleFilterChange('from', e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={filters.to} onChange={(e) => handleFilterChange('to', e.target.value)} />
          </label>
          <label>
            Summary
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              {summaryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="metrics-grid">
          <div>
            <span className="metric-label">Revenue ({period})</span>
            <span className="metric-value primary">{formatCurrency(summary?.totals?.revenue || totals.revenue)}</span>
          </div>
          <div>
            <span className="metric-label">Profit ({period})</span>
            <span className="metric-value">{formatCurrency(summary?.totals?.profit || totals.profit)}</span>
          </div>
          <div>
            <span className="metric-label">Units Sold ({period})</span>
            <span className="metric-value">{formatNumber(summary?.totals?.unitsSold || totals.units)}</span>
          </div>
        </div>

        {isLoading && <p>Loading sales…</p>}
        {sales && sales.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Revenue</th>
                <th>Profit</th>
                <th>Customer</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{formatDate(sale.saleDate)}</td>
                  <td>{sale.productName}</td>
                  <td>{sale.quantity}</td>
                  <td>{formatCurrency(sale.revenue)}</td>
                  <td>{formatCurrency(sale.profit)}</td>
                  <td>{sale.customerName || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !isLoading && <p>No sales recorded yet.</p>
        )}
      </div>

      {hasRole('staff') && (
        <div className="card">
          <h3>Log a Sale</h3>
          <form className="form-row" onSubmit={handleSubmit}>
            <label>
              Product
              <select
                value={form.productId}
                onChange={(e) => setForm((prev) => ({ ...prev, productId: e.target.value }))}
                required
              >
                <option value="">Select product</option>
                {(products || []).map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Stock {product.stockQuantity})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Quantity
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                required
              />
            </label>
            <label>
              Sale Date
              <input
                type="date"
                value={form.saleDate}
                onChange={(e) => setForm((prev) => ({ ...prev, saleDate: e.target.value }))}
                required
              />
            </label>
            <label>
              Customer (optional)
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in" />
            </label>
            <button type="submit" className="primary-button" disabled={createSaleMutation.isPending}>
              {createSaleMutation.isPending ? 'Saving…' : 'Log Sale'}
            </button>
          </form>
          {createSaleMutation.error && <p className="error">{(createSaleMutation.error as Error).message}</p>}
        </div>
      )}
    </div>
  );
};

export default SalesPage;
