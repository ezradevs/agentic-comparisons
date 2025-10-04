import React, { useState, useEffect } from 'react';
import { getDashboardStats, getRevenue, getTopProducts, getLowStockProducts } from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, AlertTriangle, Package } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('day');

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    try {
      const [statsRes, revenueRes, topProductsRes, lowStockRes] = await Promise.all([
        getDashboardStats(),
        getRevenue(period, 30),
        getTopProducts(5),
        getLowStockProducts(),
      ]);

      setStats(statsRes.data);
      setRevenueData(revenueRes.data.reverse());
      setTopProducts(topProductsRes.data);
      setLowStock(lowStockRes.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const bestSellingProduct = topProducts[0];

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-4" style={{ marginBottom: '30px' }}>
        <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Today's Revenue</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                ${(stats?.today?.revenue || 0).toFixed(2)}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                {stats?.today?.count || 0} sales
              </p>
            </div>
            <DollarSign size={40} style={{ color: '#3b82f6', opacity: 0.3 }} />
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Today's Profit</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                ${(stats?.today?.profit || 0).toFixed(2)}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Margin: {stats?.today?.revenue ? ((stats.today.profit / stats.today.revenue) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <TrendingUp size={40} style={{ color: '#10b981', opacity: 0.3 }} />
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Week's Revenue</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
                ${(stats?.week?.revenue || 0).toFixed(2)}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                {stats?.week?.count || 0} sales
              </p>
            </div>
            <ShoppingCart size={40} style={{ color: '#f59e0b', opacity: 0.3 }} />
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Low Stock Items</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{lowStock.length}</p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Needs attention</p>
            </div>
            <AlertTriangle size={40} style={{ color: '#ef4444', opacity: 0.3 }} />
          </div>
        </div>
      </div>

      {/* Real-time Insight */}
      {bestSellingProduct && (
        <div className="alert alert-info" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package size={24} />
            <div>
              <strong>Best Selling Product:</strong> {bestSellingProduct.name} ({bestSellingProduct.sku}) -
              {' '}{bestSellingProduct.total_quantity} units sold,
              ${bestSellingProduct.total_revenue.toFixed(2)} revenue
            </div>
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Revenue Trends</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className={period === 'day' ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => setPeriod('day')}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Daily
            </button>
            <button
              className={period === 'week' ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => setPeriod('week')}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Weekly
            </button>
            <button
              className={period === 'month' ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => setPeriod('month')}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Monthly
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
            <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-2">
        {/* Top Products */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Top Products</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_revenue" fill="#3b82f6" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock Alert */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            Low Stock Alert
          </h2>
          {lowStock.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>
              All products have sufficient stock!
            </p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>
                        <span className="badge badge-warning">{product.stock_quantity}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          Monthly Summary (Last 30 Days)
        </h2>
        <div className="grid grid-3">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Total Sales</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats?.month?.count || 0}</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Total Revenue</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
              ${(stats?.month?.revenue || 0).toFixed(2)}
            </p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Total Profit</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
              ${(stats?.month?.profit || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
