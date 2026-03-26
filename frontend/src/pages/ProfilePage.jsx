import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/client';
import { useToast, Toast } from '../components/Toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast, show } = useToast();
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [pwError, setPwError] = useState('');

  const handlePw = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value });

  const changePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.new_password !== pwForm.confirm) {
      setPwError("New passwords don't match");
      return;
    }
    setSaving(true);
    try {
      await authAPI.changePassword({
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      });
      show('Password changed successfully!');
      setPwForm({ old_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Profile Info */}
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 20 }}>Account Info</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div className="form-label">Full Name</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>{user?.full_name}</div>
            </div>
            <div>
              <div className="form-label">Email</div>
              <div style={{ fontSize: 14 }}>{user?.email}</div>
            </div>
            <div>
              <div className="form-label">Role</div>
              <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            </div>
            <div>
              <div className="form-label">Status</div>
              <span style={{ color: 'var(--accent2)', fontSize: 13 }}>● Active</span>
            </div>
            <div>
              <div className="form-label">User ID</div>
              <div style={{ color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>#{user?.id}</div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 20 }}>Change Password</h3>

          <form onSubmit={changePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                name="old_password"
                value={pwForm.old_password}
                onChange={handlePw}
                required
                placeholder="Your current password"
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="new_password"
                value={pwForm.new_password}
                onChange={handlePw}
                required
                placeholder="Min 6 characters"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirm"
                value={pwForm.confirm}
                onChange={handlePw}
                required
                placeholder="Repeat new password"
              />
            </div>

            {pwError && <div className="form-error" style={{ marginBottom: 12 }}>✕ {pwError}</div>}

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* JWT explanation card for learning */}
      <div className="card" style={{ marginTop: 20, borderColor: 'rgba(240,192,64,0.3)' }}>
        <h3 style={{ fontSize: 14, color: 'var(--accent)', marginBottom: 12 }}>◈ How Your Session Works (JWT)</h3>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 2 }}>
          <div>1. When you logged in, the server created a <strong style={{ color: 'var(--text)' }}>JWT (JSON Web Token)</strong> signed with a secret key.</div>
          <div>2. That token is stored in your browser and sent with <strong style={{ color: 'var(--text)' }}>every API request</strong> as an Authorization header.</div>
          <div>3. The server <strong style={{ color: 'var(--text)' }}>verifies the signature</strong> on each request — no database lookup needed.</div>
          <div>4. The token expires in <strong style={{ color: 'var(--text)' }}>30 minutes</strong>. After that, you'll be asked to log in again.</div>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
