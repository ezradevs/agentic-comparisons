import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../hooks/useApi';
import { useAuthContext } from '../context/AuthContext';
import type { Product } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

const emptyProduct = {
  name: '',
  category: '',
  sku: '',
  costPrice: 0,
  salePrice: 0,
  stockQuantity: 0,
  supplier: '',
  reorderLevel: 5,
};

type ProductForm = typeof emptyProduct;

const InventoryPage = () => {
  const api = useApi();
  const { hasRole } = useAuthContext();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProductForm>({ ...emptyProduct });
  const [editing, setEditing] = useState<Product | null>(null);

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => api.get<Product[]>('/api/products'),
  });

  const sortedProducts = useMemo(() => {
    return [...(products || [])].sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const createMutation = useMutation({
    mutationFn: (payload: ProductForm) => api.post<Product>('/api/products', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; data: ProductForm }) =>
      api.put<Product>(`/api/products/${payload.id}`, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.del(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const resetForm = () => {
    setForm({ ...emptyProduct });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsed: ProductForm = {
      ...form,
      costPrice: Number(form.costPrice),
      salePrice: Number(form.salePrice),
      stockQuantity: Number(form.stockQuantity),
      reorderLevel: Number(form.reorderLevel),
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: parsed });
    } else {
      createMutation.mutate(parsed);
    }
  };

  const startEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      category: product.category || '',
      sku: product.sku,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      stockQuantity: product.stockQuantity,
      supplier: product.supplier || '',
      reorderLevel: product.reorderLevel,
    });
    setShowForm(true);
  };

  const isProcessing = createMutation.isPending || updateMutation.isPending;
  const formError = (createMutation.error || updateMutation.error) as Error | null;

  return (
    <div className="stack">
      <div className="card">
        <div className="card-header">
          <div>
            <h2>Inventory</h2>
            <p className="subtitle">Manage products, pricing, and stock levels.</p>
          </div>
          {hasRole('admin') && (
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setEditing(null);
                setForm({ ...emptyProduct });
                setShowForm(true);
              }}
            >
              Add Product
            </button>
          )}
        </div>
        {isLoading && <p>Loading products…</p>}
        {error && <p className="error">Failed to load products.</p>}
        {products && products.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Pricing</th>
                <th>Stock</th>
                <th>Supplier</th>
                <th>Updated</th>
                {hasRole('admin') && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{product.category || '—'}</td>
                  <td>
                    <div>{formatCurrency(product.salePrice)}</div>
                    <small>{formatCurrency(product.costPrice)} cost</small>
                  </td>
                  <td>
                    {product.stockQuantity} units
                    <br />
                    <small>Reorder ≤ {product.reorderLevel}</small>
                  </td>
                  <td>{product.supplier || '—'}</td>
                  <td>{product.updatedAt ? formatDate(product.updatedAt) : '—'}</td>
                  {hasRole('admin') && (
                    <td className="actions">
                      <button type="button" onClick={() => startEdit(product)} className="link-button">
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Delete this product?')) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                        className="link-button danger"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !isLoading && <p>No products yet.</p>
        )}
      </div>

      {showForm && hasRole('admin') && (
        <div className="drawer">
          <form className="drawer-content" onSubmit={handleSubmit}>
            <div className="drawer-header">
              <h3>{editing ? `Edit ${editing.name}` : 'Add a new product'}</h3>
              <button type="button" onClick={resetForm} className="secondary-button">
                Close
              </button>
            </div>
            <div className="form-grid">
              <label>
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </label>
              <label>
                SKU
                <input
                  value={form.sku}
                  onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                  required
                />
              </label>
              <label>
                Category
                <input
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                />
              </label>
              <label>
                Supplier
                <input
                  value={form.supplier}
                  onChange={(e) => setForm((prev) => ({ ...prev, supplier: e.target.value }))}
                />
              </label>
              <label>
                Cost Price
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.costPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, costPrice: Number(e.target.value) }))}
                  required
                />
              </label>
              <label>
                Sale Price
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.salePrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, salePrice: Number(e.target.value) }))}
                  required
                />
              </label>
              <label>
                Stock Quantity
                <input
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(e) => setForm((prev) => ({ ...prev, stockQuantity: Number(e.target.value) }))}
                  required
                />
              </label>
              <label>
                Reorder Level
                <input
                  type="number"
                  min="0"
                  value={form.reorderLevel}
                  onChange={(e) => setForm((prev) => ({ ...prev, reorderLevel: Number(e.target.value) }))}
                  required
                />
              </label>
            </div>
            <div className="drawer-footer">
              <button type="submit" className="primary-button" disabled={isProcessing}>
                {isProcessing ? 'Saving…' : editing ? 'Update Product' : 'Create Product'}
              </button>
            </div>
            {formError && <p className="error">{formError.message}</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
