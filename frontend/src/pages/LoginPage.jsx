import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1>TaskFlow</h1>
        <p className="subtitle">Sign in to your workspace</p>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" value={form.password} onChange={handle} required placeholder="••••••••" />
          </div>

          {error && <div className="form-error" style={{ marginBottom: 12 }}>✕ {error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
          No account? <Link to="/register">Register here</Link>
        </div>

        <div style={{ marginTop: 24, padding: 16, background: 'var(--surface2)', borderRadius: 'var(--radius)', fontSize: 12 }}>
          <div style={{ color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo credentials</div>
          <div>admin@taskflow.com / admin123</div>
          <div>alice@taskflow.com / alice123</div>
        </div>
      </div>
    </div>
  );
}
