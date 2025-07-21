const API_BASE_URL = 'http://localhost/backend';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    return this.request('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout.php', {
      method: 'POST',
    });
  }

  async checkSession() {
    return this.request('/auth/session.php');
  }

  // Tasks
  async getTasks() {
    return this.request('/tasks/get_tasks.php');
  }

  async createTask(taskData) {
    return this.request('/tasks/create_task.php', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTaskStatus(taskId, newStatus) {
    return this.request('/tasks/update_task_status.php', {
      method: 'PUT',
      body: JSON.stringify({ task_id: taskId, new_status: newStatus }),
    });
  }

  // Users
  async getUsers() {
    return this.request('/users/get_users.php');
  }

  async createUser(userData) {
    return this.request('/users/create_user.php', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Statistics
  async getUserStats(userId = null) {
    const endpoint = userId ? `/stats/user_stats.php?user_id=${userId}` : '/stats/user_stats.php';
    return this.request(endpoint);
  }

  async getGlobalStats() {
    return this.request('/stats/global_stats.php');
  }
}

export default new ApiService();
