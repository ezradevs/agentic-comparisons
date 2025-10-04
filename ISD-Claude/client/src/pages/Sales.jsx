import React, { useState, useEffect } from 'react';
import { getSales, createSale, deleteSale, getProducts, getCustomers, getSalesByDateRange } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Sales = () => {
  const { hasRole } = useAuth();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [formData, setFormData] = useState({
    product_id: '',
    customer_id: '',
    quantity: '',
    unit_price: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [salesRes, productsRes, customersRes] = await Promise.all([
        getSales(),
        getProducts(),
        getCustomers(),
      ]);
      setSales(salesRes.data);
      setProducts(productsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        product_id: parseInt(formData.product_id),
        customer_id: formData.customer_id ? parseInt(formData.customer_id) : null,
        quantity: parseInt(formData.quantity),
        unit_price: parseFloat(formData.unit_price),
      };
      await createSale(data);
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create sale');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will restore the stock.')) return;
    try {
      await deleteSale(id);
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Delete failed');
    }
  };

  const handleProductChange = (productId) => {
    const product = products.find((p) => p.id === parseInt(productId));
    setFormData({
      ...formData,
      product_id: productId,
      unit_price: product ? product.sale_price : '',
    });
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      customer_id: '',
      quantity: '',
      unit_price: '',
      notes: '',
    });
  };

  const handleFilter = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      loadData();
      return;
    }
    try {
      const res = await getSalesByDateRange(dateRange.startDate, dateRange.endDate);
      setSales(res.data);
    } catch (error) {
      alert('Failed to filter sales');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Product', 'SKU', 'Customer', 'Quantity', 'Unit Price', 'Total', 'Profit'];
    const rows = sales.map((sale) => [
      format(new Date(sale.sale_date), 'yyyy-MM-dd HH:mm'),
      sale.product_name,
      sale.sku,
      sale.customer_name || 'N/A',
      sale.quantity,
      `$${sale.unit_price.toFixed(2)}`,
      `$${sale.total_amount.toFixed(2)}`,
      `$${sale.profit.toFixed(2)}`,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Sales Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 22);

    const tableData = sales.map((sale) => [
      format(new Date(sale.sale_date), 'yyyy-MM-dd'),
      sale.product_name,
      sale.sku,
      sale.customer_name || 'N/A',
      sale.quantity,
      `$${sale.unit_price.toFixed(2)}`,
      `$${sale.total_amount.toFixed(2)}`,
      `$${sale.profit.toFixed(2)}`,
    ]);

    doc.autoTable({
      head: [['Date', 'Product', 'SKU', 'Customer', 'Qty', 'Price', 'Total', 'Profit']],
      body: tableData,
      startY: 28,
      styles: { fontSize: 8 },
    });

    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, finalY);
    doc.text(`Total Profit: $${totalProfit.toFixed(2)}`, 14, finalY + 7);

    doc.save(`sales-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const canCreate = hasRole('admin', 'staff');
  const canDelete = hasRole('admin');

  if (loading) return <div className="loading">Loading...</div>;

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
  const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Sales</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={exportToCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={20} />
            CSV
          </button>
          <button
            className="btn btn-secondary"
            onClick={exportToPDF}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Download size={20} />
            PDF
          </button>
          {canCreate && (
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={20} />
              Log Sale
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            />
          </div>
          <button className="btn btn-primary" onClick={handleFilter}>
            Filter
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setDateRange({ startDate: '', endDate: '' });
              loadData();
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: '20px' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Total Revenue</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Total Profit</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
            ${totalProfit.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Customer</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th>Profit</th>
                <th>Created By</th>
                {canDelete && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{format(new Date(sale.sale_date), 'yyyy-MM-dd HH:mm')}</td>
                  <td>{sale.product_name}</td>
                  <td>{sale.sku}</td>
                  <td>{sale.customer_name || '-'}</td>
                  <td>{sale.quantity}</td>
                  <td>${sale.unit_price.toFixed(2)}</td>
                  <td>${sale.total_amount.toFixed(2)}</td>
                  <td style={{ color: sale.profit >= 0 ? '#10b981' : '#ef4444' }}>
                    ${sale.profit.toFixed(2)}
                  </td>
                  <td>{sale.created_by_username}</td>
                  {canDelete && (
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(sale.id)}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Log Sale</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product *</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => handleProductChange(e.target.value)}
                  required
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku}) - Stock: {product.stock_quantity}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Customer (Optional)</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Unit Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Sale
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
