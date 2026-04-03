import { useState, useEffect } from 'react';
import { usersAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast, Toast } from '../components/Toast';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, show } = useToast();

  const load = () =>
    usersAPI.list().then(r => setUsers(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const toggleActive = async (u) => {
    if (u.id === currentUser.id) return show("You can't deactivate yourself", 'error');
    try {
      await usersAPI.update(u.id, { is_active: !u.is_active });
      show(`User ${u.is_active ? 'deactivated' : 'activated'}`);
      load();
    } catch {
      show('Failed to update user', 'error');
    }
  };

  const deleteUser = async (u) => {
    if (u.id === currentUser.id) return show("You can't delete yourself", 'error');
    if (!confirm(`Delete user ${u.full_name}?`)) return;
    try {
      await usersAPI.delete(u.id);
      show('User deleted');
      load();
    } catch (err) {
      show(err.response?.data?.detail || 'Failed to delete user', 'error');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /> Loading users...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="text-muted" style={{ marginTop: 4, fontSize: 13 }}>
            {currentUser.role === 'admin'
              ? 'Manage all users in the system'
              : 'View team members'}
          </p>
        </div>
        <span className="text-muted" style={{ fontSize: 13 }}>{users.length} users</span>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                {currentUser.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{u.id}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {u.full_name}
                      {u.id === currentUser.id && (
                        <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--accent)' }}>(you)</span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>{u.email}</td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td>
                    <span style={{
                      fontSize: 12,
                      color: u.is_active ? 'var(--accent2)' : 'var(--danger)',
                      display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: u.is_active ? 'var(--accent2)' : 'var(--danger)',
                        display: 'inline-block'
                      }} />
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  {currentUser.role === 'admin' && (
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => toggleActive(u)}
                          disabled={u.id === currentUser.id}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteUser(u)}
                          disabled={u.id === currentUser.id}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
