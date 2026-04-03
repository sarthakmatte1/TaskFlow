import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, tasksAPI, usersAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { useToast, Toast } from '../components/Toast';

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast, show } = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { title: '', description: '', priority: 'medium', status: 'todo', assignee_id: '', due_date: '' };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      const [proj, taskList, userList] = await Promise.all([
        projectsAPI.get(id),
        tasksAPI.list({ project_id: id }),
        usersAPI.list(),
      ]);
      setProject(proj.data);
      setTasks(taskList.data);
      setUsers(userList.data);
    } catch {
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setSelectedTask(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (task) => {
    setSelectedTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assignee_id: task.assignee_id || '',
      due_date: task.due_date ? task.due_date.slice(0, 10) : '',
    });
    setShowModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      assignee_id: form.assignee_id ? parseInt(form.assignee_id) : null,
      due_date: form.due_date || null,
    };
    try {
      if (selectedTask) {
        await tasksAPI.update(selectedTask.id, payload);
        show('Task updated!');
      } else {
        await tasksAPI.create({ ...payload, project_id: parseInt(id) });
        show('Task created!');
      }
      setShowModal(false);
      load();
    } catch (err) {
      show(err.response?.data?.detail || 'Failed to save task', 'error');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      show('Status updated');
    } catch {
      show('Failed to update status', 'error');
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksAPI.delete(taskId);
      show('Task deleted');
      load();
    } catch {
      show('Failed to delete task', 'error');
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /> Loading project...</div>;
  if (!project) return null;

  const tasksByStatus = (status) => tasks.filter(t => t.status === status);

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 4 }}>
            <span style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => navigate('/projects')}>Projects</span>
            {' / '}
          </div>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p className="text-muted" style={{ marginTop: 4 }}>{project.description}</p>}
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Task</button>
      </div>

      {/* Kanban Board */}
      <div className="kanban">
        {COLUMNS.map(col => {
          const colTasks = tasksByStatus(col.key);
          return (
            <div key={col.key} className="kanban-col">
              <div className="kanban-col-header">
                <span className="kanban-col-title">{col.label}</span>
                <span className="kanban-count">{colTasks.length}</span>
              </div>

              {colTasks.length === 0 && (
                <div style={{ color: 'var(--muted)', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
                  No tasks
                </div>
              )}

              {colTasks.map(task => {
                const assignee = users.find(u => u.id === task.assignee_id);
                return (
                  <div key={task.id} className="task-card" onClick={() => openEdit(task)}>
                    <div className="task-card-title">{task.title}</div>
                    {task.description && (
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                        {task.description.slice(0, 60)}{task.description.length > 60 ? '…' : ''}
                      </div>
                    )}
                    <div className="task-card-meta">
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      {assignee && (
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>→ {assignee.full_name.split(' ')[0]}</span>
                      )}
                    </div>
                    {/* Quick status change */}
                    <div style={{ marginTop: 10, display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                      {COLUMNS.filter(c => c.key !== col.key).map(c => (
                        <button
                          key={c.key}
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 10, padding: '2px 6px' }}
                          onClick={() => changeStatus(task.id, c.key)}
                        >
                          → {c.label}
                        </button>
                      ))}
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ fontSize: 10, padding: '2px 6px', marginLeft: 'auto' }}
                        onClick={() => deleteTask(task.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      {showModal && (
        <Modal title={selectedTask ? 'Edit Task' : 'New Task'} onClose={() => setShowModal(false)}>
          <form onSubmit={save}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input name="title" value={form.title} onChange={handle} required placeholder="Task title" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" value={form.description} onChange={handle} rows={3} placeholder="Optional details..." />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" value={form.status} onChange={handle}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select name="priority" value={form.priority} onChange={handle}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select name="assignee_id" value={form.assignee_id} onChange={handle}>
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input name="due_date" type="date" value={form.due_date} onChange={handle} />
              </div>
            </div>
            <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : selectedTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <Toast toast={toast} />
    </div>
  );
}
