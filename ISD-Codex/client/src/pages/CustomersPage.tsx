import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../hooks/useApi';
import { useAuthContext } from '../context/AuthContext';
import type { Customer } from '../types';
import { formatDate } from '../utils/format';

interface CustomerDetail {
  customer: Customer;
  history: Array<{
    id: number;
    productName: string;
    quantity: number;
    saleDate: string;
    revenue: number;
  }>;
}

type CustomerForm = {
  name: string;
  email?: string;
  phone?: string;
};

const CustomersPage = () => {
  const api = useApi();
  const { hasRole } = useAuthContext();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: () => api.get<Customer[]>('/api/customers'),
  });

  const { data: customerDetails } = useQuery<CustomerDetail>({
    queryKey: ['customer', selectedId],
    queryFn: () => api.get<CustomerDetail>(`/api/customers/${selectedId}`),
    enabled: Boolean(selectedId),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CustomerForm) => api.post('/api/customers', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setForm({ name: '', email: '', phone: '' });
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const payload: CustomerForm = { name: form.name };
    if (form.email) payload.email = form.email;
    if (form.phone) payload.phone = form.phone;
    createMutation.mutate(payload);
  };

  return (
    <div className="customers-grid">
      <div className="card">
        <h2>Customers</h2>
        {isLoading && <p>Loading customers…</p>}
        {customers && customers.length > 0 ? (
          <ul className="customer-list">
            {customers.map((customer) => (
              <li
                key={customer.id}
                className={selectedId === customer.id ? 'selected' : ''}
                onClick={() => setSelectedId(customer.id)}
              >
                <div className="title">{customer.name}</div>
                <div className="muted">Joined {formatDate(customer.createdAt)}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No customers yet.</p>
        )}
      </div>

      <div className="card">
        <h2>Details</h2>
        {selectedId && customerDetails ? (
          <div className="customer-details">
            <p>
              <strong>Name:</strong> {customerDetails.customer.name}
            </p>
            {customerDetails.customer.email && (
              <p>
                <strong>Email:</strong> {customerDetails.customer.email}
              </p>
            )}
            {customerDetails.customer.phone && (
              <p>
                <strong>Phone:</strong> {customerDetails.customer.phone}
              </p>
            )}
            <h3>Purchase History</h3>
            {customerDetails.history && customerDetails.history.length > 0 ? (
              <ul className="history-list">
                {customerDetails.history.map((item) => (
                  <li key={item.id}>
                    {formatDate(item.saleDate)} — {item.productName} × {item.quantity} (${item.revenue.toFixed(2)})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No purchases yet.</p>
            )}
          </div>
        ) : (
          <p>Select a customer to view details.</p>
        )}
      </div>

      {hasRole('staff') && (
        <div className="card">
          <h2>Add Customer</h2>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
            </label>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </label>
            <button type="submit" className="primary-button" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Saving…' : 'Save Customer'}
            </button>
          </form>
          {createMutation.error && <p className="error">{(createMutation.error as Error).message}</p>}
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
