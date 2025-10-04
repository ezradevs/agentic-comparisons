import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../hooks/useApi';
import { formatDate } from '../utils/format';
import type { User } from '../types';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
  { value: 'viewer', label: 'Viewer' },
];

const TeamPage = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });

  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => api.get<User[]>('/api/auth/users'),
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof form) => api.post<User>('/api/auth/users', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setForm({ name: '', email: '', password: '', role: 'staff' });
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div className="stack">
      <div className="card">
        <h2>Team Members</h2>
        {users && users.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.createdAt ? formatDate(user.createdAt) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No team members yet.</p>
        )}
      </div>

      <div className="card">
        <h2>Add Team Member</h2>
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
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </label>
          <label>
            Role
            <select value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="primary-button" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating…' : 'Invite Member'}
          </button>
        </form>
        {createMutation.error && <p className="error">{(createMutation.error as Error).message}</p>}
      </div>
    </div>
  );
};

export default TeamPage;
