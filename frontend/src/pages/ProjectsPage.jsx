import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsAPI } from '../api/client';
import Modal from '../components/Modal';
import { useToast, Toast } from '../components/Toast';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const { toast, show } = useToast();

  const load = () => projectsAPI.list().then(r => setProjects(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await projectsAPI.create(form);
      setShowModal(false);
      setForm({ name: '', description: '' });
      show('Project created!');
      load();
    } catch (err) {
      show(err.response?.data?.detail || 'Failed to create project', 'error');
    } finally {
      setSaving(false);
    }
  };

  const del = async (id, e) => {
    e.preventDefault();
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await projectsAPI.delete(id);
      show('Project deleted');
      load();
    } catch (err) {
      show('Failed to delete', 'error');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /> Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="card empty-state">
          <div className="icon">▣</div>
          <div>No projects yet. Create your first one!</div>
        </div>
      ) : (
        <div className="grid-2">
          {projects.map(p => (
            <Link key={p.id} to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div className="flex items-center justify-between">
                  <h3 style={{ fontSize: 16 }}>{p.name}</h3>
                  <button className="btn btn-danger btn-sm" onClick={(e) => del(p.id, e)}>Delete</button>
                </div>
                {p.description && <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>{p.description}</p>}
                <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>
                  Created {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="New Project" onClose={() => setShowModal(false)}>
          <form onSubmit={create}>
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input name="name" value={form.name} onChange={handle} required placeholder="e.g. Website Redesign" />
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea name="description" value={form.description} onChange={handle} rows={3} placeholder="What is this project about?" />
            </div>
            <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Project'}</button>
            </div>
          </form>
        </Modal>
      )}

      <Toast toast={toast} />
    </div>
  );
}
