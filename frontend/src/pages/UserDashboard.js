import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';

function UserDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tasks') {
        const tasksRes = await ApiService.getTasks();
        setTasks(tasksRes.tasks);
      } else if (activeTab === 'stats') {
        const statsRes = await ApiService.getUserStats();
        setStats(statsRes);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'Pending': 'In Progress',
      'In Progress': 'Needs Review',
      'Needs Review': 'In Review',
      'In Review': 'Needs Validation',
      'Needs Validation': 'Done',
      'Done': null
    };
    return statusFlow[currentStatus];
  };

  const canTakeTask = (task) => {
    return task.progress === 'Pending' && !task.assigned_user_id;
  };

  const canUpdateTask = (task) => {
    return task.assigned_user_id === user.id && task.progress !== 'Done';
  };

  const myTasks = tasks.filter(task => task.assigned_user_id === user.id);
  const availableTasks = tasks.filter(task => task.progress === 'Pending' && !task.assigned_user_id);
  const allTasks = tasks;

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2 className="sidebar-title">User Panel</h2>
        <ul className="sidebar-nav">
          <li>
            <button 
              className={activeTab === 'tasks' ? 'active' : ''}
              onClick={() => setActiveTab('tasks')}
            >
              All Tasks
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'my-tasks' ? 'active' : ''}
              onClick={() => setActiveTab('my-tasks')}
            >
              My Tasks
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'available' ? 'active' : ''}
              onClick={() => setActiveTab('available')}
            >
              Available Tasks
            </button>
          </li>
          <li>
            <button 
              className={activeTab === 'stats' ? 'active' : ''}
              onClick={() => setActiveTab('stats')}
            >
              My Statistics
            </button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1 className="header-title">
            {activeTab === 'tasks' && 'All Tasks'}
            {activeTab === 'my-tasks' && 'My Tasks'}
            {activeTab === 'available' && 'Available Tasks'}
            {activeTab === 'stats' && 'My Statistics'}
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

        {activeTab === 'tasks' && (
          <div className="card">
            <h3 className="card-title">All Tasks Overview</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {allTasks.map(task => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td><span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span></td>
                      <td><span className={getStatusBadgeClass(task.progress)}>{task.progress}</span></td>
                      <td>{task.assigned_user_name || 'Unassigned'}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {task.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'my-tasks' && (
          <div className="card">
            <h3 className="card-title">My Assigned Tasks</h3>
            {myTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                You don't have any assigned tasks yet.
              </p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myTasks.map(task => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td><span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span></td>
                        <td><span className={getStatusBadgeClass(task.progress)}>{task.progress}</span></td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {task.description}
                        </td>
                        <td>
                          {canUpdateTask(task) && getNextStatus(task.progress) && (
                            <button
                              className="btn btn-success"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                              onClick={() => handleUpdateTaskStatus(task.id, getNextStatus(task.progress))}
                            >
                              Move to {getNextStatus(task.progress)}
                            </button>
                          )}
                          {task.progress === 'Done' && (
                            <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '500' }}>
                              Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'available' && (
          <div className="card">
            <h3 className="card-title">Available Tasks (Take Ownership)</h3>
            {availableTasks.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                No available tasks at the moment.
              </p>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableTasks.map(task => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td><span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span></td>
                        <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {task.description}
                        </td>
                        <td>
                          <button
                            className="btn btn-primary"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            onClick={() => handleUpdateTaskStatus(task.id, 'In Progress')}
                          >
                            Take Task
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && stats && (
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
                <div className="stat-number">{stats.task_stats.pending_tasks}</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Task Status Breakdown</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.task_stats.needs_review_tasks}</div>
                  <div className="stat-label">Needs Review</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.task_stats.in_review_tasks}</div>
                  <div className="stat-label">In Review</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.task_stats.needs_validation_tasks}</div>
                  <div className="stat-label">Needs Validation</div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Priority Breakdown</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.task_stats.high_priority_tasks}</div>
                  <div className="stat-label">High Priority</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.task_stats.medium_priority_tasks}</div>
                  <div className="stat-label">Medium Priority</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.task_stats.low_priority_tasks}</div>
                  <div className="stat-label">Low Priority</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
