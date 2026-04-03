import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>TaskFlow</h1>
        <p className="subtitle">Create your account</p>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="full_name" value={form.full_name} onChange={handle} required placeholder="Jane Doe" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} required placeholder="min 6 characters" />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select name="role" value={form.role} onChange={handle}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <div className="form-error" style={{ marginBottom: 12 }}>✕ {error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
