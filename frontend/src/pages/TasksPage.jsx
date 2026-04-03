import { useState, useEffect } from 'react';
import { tasksAPI, projectsAPI, usersAPI } from '../api/client';
import { useToast, Toast } from '../components/Toast';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, show } = useToast();

  // Filters
  const [filters, setFilters] = useState({ status: '', priority: '', project_id: '' });

  const load = async () => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.project_id) params.project_id = filters.project_id;

    try {
      const [t, p, u] = await Promise.all([
        tasksAPI.list(params),
        projectsAPI.list(),
        usersAPI.list(),
      ]);
      setTasks(t.data);
      setProjects(p.data);
      setUsers(u.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters]);

  const handleFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const changeStatus = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      show('Status updated');
    } catch {
      show('Failed', 'error');
    }
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(id);
      show('Task deleted');
      load();
    } catch {
      show('Failed to delete', 'error');
    }
  };

  const getProject = (id) => projects.find(p => p.id === id)?.name || '—';
  const getUser = (id) => users.find(u => u.id === id)?.full_name || '—';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">All Tasks</h1>
        <span className="text-muted" style={{ fontSize: 13 }}>{tasks.length} tasks</span>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Status</label>
            <select name="status" value={filters.status} onChange={handleFilter}>
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Priority</label>
            <select name="priority" value={filters.priority} onChange={handleFilter}>
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Project</label>
            <select name="project_id" value={filters.project_id} onChange={handleFilter}>
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => setFilters({ status: '', priority: '', project_id: '' })}
            style={{ whiteSpace: 'nowrap' }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="loading-page"><div className="spinner" /> Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="card empty-state">
          <div className="icon">✦</div>
          <div>No tasks match the current filters</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                  <th>Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{task.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{task.title}</div>
                      {task.description && (
                        <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                          {task.description.slice(0, 50)}{task.description.length > 50 ? '…' : ''}
                        </div>
                      )}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{getProject(task.project_id)}</td>
                    <td>
                      {/* Inline status change dropdown */}
                      <select
                        className="status-select"
                        value={task.status}
                        onChange={(e) => changeStatus(task.id, e.target.value)}
                        style={{
                          background: 'var(--surface2)',
                          border: '1px solid var(--border)',
                          borderRadius: 4,
                          color: task.status === 'done' ? 'var(--accent2)' : task.status === 'in_progress' ? '#60a5fa' : 'var(--muted)',
                          padding: '3px 8px',
                          fontSize: 12,
                          width: 'auto',
                        }}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td><span className={`badge badge-${task.priority}`}>{task.priority}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--muted)' }}>{getUser(task.assignee_id)}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
