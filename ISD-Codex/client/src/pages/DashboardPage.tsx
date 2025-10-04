import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApi } from '../hooks/useApi';
import type { DashboardData } from '../types';
import { formatCurrency, formatNumber } from '../utils/format';

const DashboardPage = () => {
  const api = useApi();
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get<DashboardData>('/api/reports/dashboard'),
  });

  if (isLoading) {
    return <div className="card">Loading dashboard…</div>;
  }

  if (error) {
    return <div className="card error">Failed to load dashboard: {(error as Error).message}</div>;
  }

  if (!data) {
    return <div className="card">No dashboard data available yet.</div>;
  }

  const summary = data.summary || { revenue: 0, profit: 0, unitsSold: 0, productsSold: 0 };

  return (
    <div className="dashboard-grid">
      <section className="card">
        <h2>Performance Snapshot</h2>
        <div className="metrics-grid">
          <div>
            <span className="metric-label">Revenue</span>
            <span className="metric-value primary">{formatCurrency(summary.revenue || 0)}</span>
          </div>
          <div>
            <span className="metric-label">Profit</span>
            <span className="metric-value">{formatCurrency(summary.profit || 0)}</span>
          </div>
          <div>
            <span className="metric-label">Units Sold</span>
            <span className="metric-value">{formatNumber(summary.unitsSold || 0)}</span>
          </div>
          <div>
            <span className="metric-label">Products Sold</span>
            <span className="metric-value">{formatNumber(summary.productsSold || 0)}</span>
          </div>
        </div>
        {data.bestSeller && (
          <div className="highlight">
            Best seller this week: <strong>{data.bestSeller.name}</strong> ({formatNumber(data.bestSeller.unitsSold)} units)
          </div>
        )}
      </section>

      <section className="card chart-card">
        <div className="card-header">
          <h2>Daily Revenue (Last 30 periods)</h2>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={(data.revenueByDay || []).slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" hide={false} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} width={120} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Period: ${label}`} />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card chart-card">
        <div className="card-header">
          <h2>Top Products (30 days)</h2>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.topProducts || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-10} textAnchor="end" height={80} />
              <YAxis tickFormatter={(value) => formatNumber(value)} />
              <Tooltip formatter={(value: number) => formatNumber(value)} />
              <Bar dataKey="unitsSold" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>Low Stock Alerts</h2>
        </div>
        {data.lowStock.length === 0 ? (
          <p>Inventory levels look healthy.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Reorder Level</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStock.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.sku}</td>
                  <td className="warn">{item.stockQuantity}</td>
                  <td>{item.reorderLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default DashboardPage;
