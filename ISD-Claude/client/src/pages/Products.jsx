import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct, getLowStockProducts } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';

const Products = () => {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sku: '',
    cost_price: '',
    sale_price: '',
    stock_quantity: '',
    supplier: '',
    low_stock_threshold: '10',
  });

  useEffect(() => {
    loadProducts();
    loadLowStock();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLowStock = async () => {
    try {
      const res = await getLowStockProducts();
      setLowStock(res.data);
    } catch (error) {
      console.error('Failed to load low stock:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
      loadLowStock();
    } catch (error) {
      alert(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      loadProducts();
      loadLowStock();
    } catch (error) {
      alert(error.response?.data?.error || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      sku: '',
      cost_price: '',
      sale_price: '',
      stock_quantity: '',
      supplier: '',
      low_stock_threshold: '10',
    });
  };

  const canEdit = hasRole('admin', 'staff');
  const canDelete = hasRole('admin');

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Products</h1>
        {canEdit && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingProduct(null);
              resetForm();
              setShowModal(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={20} />
            Add Product
          </button>
        )}
      </div>

      {lowStock.length > 0 && (
        <div className="alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={20} />
          <div>
            <strong>Low Stock Alert:</strong> {lowStock.length} product(s) running low on stock
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Cost Price</th>
                <th>Sale Price</th>
                <th>Stock</th>
                <th>Supplier</th>
                {(canEdit || canDelete) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>${product.cost_price.toFixed(2)}</td>
                  <td>${product.sale_price.toFixed(2)}</td>
                  <td>
                    {product.stock_quantity <= product.low_stock_threshold ? (
                      <span className="badge badge-warning">{product.stock_quantity}</span>
                    ) : (
                      <span className="badge badge-success">{product.stock_quantity}</span>
                    )}
                  </td>
                  <td>{product.supplier || '-'}</td>
                  {(canEdit || canDelete) && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {canEdit && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleEdit(product)}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            <Edit size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(product.id)}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
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
              <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Cost Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Sale Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Low Stock Threshold *</label>
                  <input
                    type="number"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingProduct ? 'Update' : 'Create'}
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

export default Products;
