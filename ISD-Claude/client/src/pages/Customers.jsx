import React, { useState, useEffect } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomerHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

const Customers = () => {
  const { hasRole } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
      } else {
        await createCustomer(formData);
      }
      setShowModal(false);
      setEditingCustomer(null);
      resetForm();
      loadCustomers();
    } catch (error) {
      alert(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await deleteCustomer(id);
      loadCustomers();
    } catch (error) {
      alert(error.response?.data?.error || 'Delete failed');
    }
  };

  const handleViewHistory = async (customer) => {
    try {
      const res = await getCustomerHistory(customer.id);
      setCustomerHistory({ customer, ...res.data });
      setShowHistory(true);
    } catch (error) {
      alert('Failed to load customer history');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  const canEdit = hasRole('admin', 'staff');
  const canDelete = hasRole('admin');

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Customers</h1>
        {canEdit && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingCustomer(null);
              resetForm();
              setShowModal(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={20} />
            Add Customer
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.address || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleViewHistory(customer)}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                        title="View Purchase History"
                      >
                        <Eye size={14} />
                      </button>
                      {canEdit && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleEdit(customer)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <Edit size={14} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(customer.id)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingCustomer ? 'Update' : 'Create'}
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

      {/* Purchase History Modal */}
      {showHistory && customerHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Purchase History - {customerHistory.customer.name}</h2>
              <button className="modal-close" onClick={() => setShowHistory(false)}>
                ×
              </button>
            </div>

            <div className="grid grid-3" style={{ marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Total Purchases</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{customerHistory.stats.total_purchases || 0}</p>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Total Spent</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                  ${(customerHistory.stats.total_spent || 0).toFixed(2)}
                </p>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>Last Purchase</p>
                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {customerHistory.stats.last_purchase_date
                    ? format(new Date(customerHistory.stats.last_purchase_date), 'yyyy-MM-dd')
                    : 'N/A'}
                </p>
              </div>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>Purchase History</h3>
            {customerHistory.history.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No purchases yet</p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerHistory.history.map((purchase) => (
                      <tr key={purchase.id}>
                        <td>{format(new Date(purchase.sale_date), 'yyyy-MM-dd')}</td>
                        <td>{purchase.product_name}</td>
                        <td>{purchase.sku}</td>
                        <td>{purchase.quantity}</td>
                        <td>${purchase.total_amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
