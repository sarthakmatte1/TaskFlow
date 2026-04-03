import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tasksAPI, projectsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([tasksAPI.list(), projectsAPI.list()])
      .then(([t, p]) => {
        setTasks(t.data);
        setProjects(p.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  const recentTasks = tasks.slice(0, 5);

  if (loading) return <div className="loading-page"><div className="spinner" /> Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-muted" style={{ marginTop: 4 }}>Welcome back, {user?.full_name} ◈</p>
        </div>
        <div className="flex gap-2">
          <Link to="/tasks" className="btn btn-ghost">View Tasks</Link>
          <Link to="/projects" className="btn btn-primary">+ New Project</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#60a5fa' }}>{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent2)' }}>{stats.done}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 style={{ fontSize: 16 }}>Recent Tasks</h3>
            <Link to="/tasks" style={{ fontSize: 12 }}>View all →</Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state"><div className="icon">✦</div>No tasks yet</div>
          ) : (
            recentTasks.map(task => (
              <div key={task.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13 }}>{task.title}</span>
                  <div className="flex gap-2">
                    <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 style={{ fontSize: 16 }}>Projects</h3>
            <Link to="/projects" style={{ fontSize: 12 }}>View all →</Link>
          </div>
          {projects.length === 0 ? (
            <div className="empty-state"><div className="icon">▣</div>No projects yet</div>
          ) : (
            projects.slice(0, 5).map(p => (
              <div key={p.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <Link to={`/projects/${p.id}`} style={{ color: 'var(--text)', fontSize: 13 }}>{p.name}</Link>
                {p.description && <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 2 }}>{p.description}</div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
