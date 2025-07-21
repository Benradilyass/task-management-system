import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const [tasksRes, statsRes] = await Promise.all([
          ApiService.getTasks(),
          ApiService.getGlobalStats()
        ]);
        setTasks(tasksRes.tasks);
        setStats(statsRes);
      } else if (activeTab === 'tasks') {
        const tasksRes = await ApiService.getTasks();
        setTasks(tasksRes.tasks);
      } else if (activeTab === 'users') {
        const usersRes = await ApiService.getUsers();
        setUsers(usersRes.users);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await ApiService.createTask(taskData);
      setSuccess('Task created successfully');
      setShowTaskModal(false);
      loadData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await ApiService.createUser(userData);
      setSuccess('User created successfully');
      setShowUserModal(false);
      loadData();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await ApiService.updateTaskStatus(taskId, newStatus);
      setSuccess('Task status updated successfully');
      loadData();
    } catch (error) {
      setError(error.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Pending': 'status-pending',
      'In Progress': 'status-in-progress',
      'Needs Review': 'status-needs-review',
      'In Review': 'status-in-review',
      'Needs Validation': 'status-needs-validation',
      'Done': 'status-done'
    };
    return `status-badge ${statusMap[status] || ''}`;
  };

  const getPriorityBadgeClass = (priority) => {
    const priorityMap = {
      'High': 'priority-high',
      'Medium': 'priority-medium',
      'Low': 'priority-low'
    };
    return `status-badge ${priorityMap[priority] || ''}`;
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <ul className="sidebar-nav">
          <li>
            <button 
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'tasks' ? 'active' : ''}
              onClick={() => setActiveTab('tasks')}
            >
              Tasks
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1 className="header-title">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'tasks' && 'Task Management'}
            {activeTab === 'users' && 'User Management'}
          </h1>
          <div className="user-info">
            <span className="user-name">Welcome, {user.name} {user.surname}</span>
            <button className="btn btn-secondary" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {activeTab === 'dashboard' && stats && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats.task_stats.total_tasks}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.task_stats.completed_tasks}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.task_stats.in_progress_tasks}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.user_stats.total_users}</div>
                <div className="stat-label">Total Users</div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Recent Tasks</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.slice(0, 5).map(task => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td><span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span></td>
                        <td><span className={getStatusBadgeClass(task.progress)}>{task.progress}</span></td>
                        <td>{task.assigned_user_name || 'Unassigned'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowTaskModal(true)}
              >
                Create New Task
              </button>
            </div>

            <div className="card">
              <h3 className="card-title">All Tasks</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td><span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span></td>
                        <td><span className={getStatusBadgeClass(task.progress)}>{task.progress}</span></td>
                        <td>{task.assigned_user_name || 'Unassigned'}</td>
                        <td>{new Date(task.created_at).toLocaleDateString()}</td>
                        <td>
                          <select 
                            value={task.progress}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                            style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Needs Review">Needs Review</option>
                            <option value="In Review">In Review</option>
                            <option value="Needs Validation">Needs Validation</option>
                            <option value="Done">Done</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowUserModal(true)}
              >
                Create New User
              </button>
            </div>

            <div className="card">
              <h3 className="card-title">All Users</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.name} {user.surname}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`status-badge ${user.role === 'admin' ? 'status-done' : 'status-pending'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.phone_number || 'N/A'}</td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {showTaskModal && (
        <TaskModal 
          onClose={() => setShowTaskModal(false)}
          onSubmit={handleCreateTask}
          users={users}
        />
      )}

      {showUserModal && (
        <UserModal 
          onClose={() => setShowUserModal(false)}
          onSubmit={handleCreateUser}
        />
      )}
    </div>
  );
}

function TaskModal({ onClose, onSubmit, users }) {
  const [formData, setFormData] = useState({
    title: '',
    priority: 'Medium',
    description: '',
    assigned_user_id: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      assigned_user_id: formData.assigned_user_id || null
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Create New Task</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              className="form-input"
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assign To (Optional)</label>
            <select
              className="form-input"
              value={formData.assigned_user_id}
              onChange={(e) => setFormData({...formData, assigned_user_id: e.target.value})}
            >
              <option value="">Unassigned</option>
              {users.filter(user => user.role === 'user').map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.surname}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    role: 'user',
    email: '',
    password: '',
    birth_date: '',
    phone_number: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Create New User</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.surname}
                onChange={(e) => setFormData({...formData, surname: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-input"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Birth Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.birth_date}
                onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;
