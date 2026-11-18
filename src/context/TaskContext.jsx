import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('lumina_token'));
  const [tasks, setTasks] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [focusStats, setFocusStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track browser notifications to prevent duplicates
  const notifiedIdsRef = useRef(new Set());

  // Configure API Base URL: custom env var -> same-origin in production -> localhost:5000 in dev
  const API_URL =
    import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? '/api'
      : 'http://localhost:5000/api');

  const authHeaders = useCallback(() => {
    const currentToken = token || localStorage.getItem('lumina_token');
    return {
      'Content-Type': 'application/json',
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {})
    };
  }, [token]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  }, []);

  // 1. Initialize user and token
  useEffect(() => {
    const initAuth = async () => {
      try {
        let currentToken = localStorage.getItem('lumina_token');
        if (!currentToken) {
          const res = await fetch(`${API_URL}/auth/default-user`);
          const json = await res.json();
          if (json.success && json.data.token) {
            currentToken = json.data.token;
            localStorage.setItem('lumina_token', currentToken);
            setToken(currentToken);
            setUser(json.data);
          }
        } else {
          // Verify existing token
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${currentToken}` }
          });
          const json = await res.json();
          if (json.success) {
            setUser(json.data);
          } else {
            // Re-fetch default user if expired
            const defRes = await fetch(`${API_URL}/auth/default-user`);
            const defJson = await defRes.json();
            if (defJson.success) {
              localStorage.setItem('lumina_token', defJson.data.token);
              setToken(defJson.data.token);
              setUser(defJson.data);
            }
          }
        }
      } catch (err) {
        console.error('[TaskContext Auth]', err);
      }
    };

    initAuth();
  }, [API_URL]);

  // 2. Fetch all user tasks from MongoDB
  const fetchTasks = useCallback(async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.category && filters.category !== 'All') queryParams.append('category', filters.category);
      if (filters.priority && filters.priority !== 'All') queryParams.append('priority', filters.priority);
      if (filters.completed !== undefined && filters.completed !== 'all') queryParams.append('completed', filters.completed);
      if (filters.search) queryParams.append('search', filters.search);

      const url = `${API_URL}/tasks${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const res = await fetch(url, { headers: authHeaders() });
      const json = await res.json();

      if (json.success) {
        setTasks(json.data);
        setError(null);
      } else {
        setError(json.message);
      }
    } catch (err) {
      console.error('[TaskContext FetchTasks]', err);
      setError('Could not connect to task server');
    } finally {
      setLoading(false);
    }
  }, [API_URL, authHeaders]);

  // 3. Fetch Dashboard Stats calculated by MongoDB
  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard/stats`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) {
        setDashboardStats(json.data);
      }
    } catch (err) {
      console.error('[TaskContext DashboardStats]', err);
    }
  }, [API_URL, authHeaders]);

  // 4. Fetch Notifications from MongoDB
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
        setUnreadCount(json.unreadCount);

        // Check for new unread notifications and trigger browser notification if allowed
        if ('Notification' in window && Notification.permission === 'granted') {
          json.data.forEach((n) => {
            if (!n.read && !notifiedIdsRef.current.has(n._id)) {
              notifiedIdsRef.current.add(n._id);
              try {
                new Notification(n.title, {
                  body: n.message,
                  icon: '/favicon.svg'
                });
              } catch (e) {
                console.warn('[Browser Notification Error]', e);
              }
            }
          });
        }
      }
    } catch (err) {
      console.error('[TaskContext Notifications]', err);
    }
  }, [API_URL, authHeaders]);

  // 5. Fetch Focus Session stats
  const fetchFocusStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/focus-sessions/stats`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) {
        setFocusStats(json.data);
      }
    } catch (err) {
      console.error('[TaskContext FocusStats]', err);
    }
  }, [API_URL, authHeaders]);

  // Refresh all application data in parallel
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchTasks(),
      fetchDashboardStats(),
      fetchNotifications(),
      fetchFocusStats()
    ]);
  }, [fetchTasks, fetchDashboardStats, fetchNotifications, fetchFocusStats]);

  // Initial load when token is ready
  useEffect(() => {
    if (token) {
      refreshAll();

      // Poll notifications and dashboard stats every 15 seconds to sync reminders
      const interval = setInterval(() => {
        fetchNotifications();
        fetchDashboardStats();
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [token, refreshAll, fetchNotifications, fetchDashboardStats]);

  // CRUD Operations
  const createTask = async (taskData) => {
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(taskData)
      });
      const json = await res.json();
      if (json.success) {
        // Immediately refresh all dependent views
        await refreshAll();
        return { success: true, data: json.data };
      }
      return { success: false, message: json.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateTask = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (json.success) {
        await refreshAll();
        return { success: true, data: json.data };
      }
      return { success: false, message: json.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const json = await res.json();
      if (json.success) {
        await refreshAll();
        return { success: true };
      }
      return { success: false, message: json.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const toggleTask = async (id) => {
    try {
      const res = await fetch(`${API_URL}/tasks/${id}/toggle`, {
        method: 'PATCH',
        headers: authHeaders()
      });
      const json = await res.json();
      if (json.success) {
        await refreshAll();
        return { success: true, data: json.data };
      }
      return { success: false, message: json.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const recordFocusSession = async (durationMinutes, mode, notes) => {
    try {
      const res = await fetch(`${API_URL}/focus-sessions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ durationMinutes, mode, notes })
      });
      const json = await res.json();
      if (json.success) {
        await Promise.all([fetchFocusStats(), fetchDashboardStats()]);
        return { success: true, data: json.data };
      }
      return { success: false, message: json.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: authHeaders()
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: authHeaders()
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper: calculate deadline label & status
  const getDeadlineStatus = (task) => {
    if (task.completed) {
      return { label: 'Completed', colorClass: 'status-completed', isOverdue: false };
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const taskDate = new Date(task.dueDate);
    const startOfTaskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());

    const diffMs = startOfTaskDay.getTime() - startOfToday.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Overdue', colorClass: 'status-overdue', isOverdue: true };
    }
    if (diffDays === 0) {
      return { label: 'Due today', colorClass: 'status-today', isOverdue: false };
    }
    if (diffDays === 1) {
      return { label: 'Due tomorrow', colorClass: 'status-tomorrow', isOverdue: false };
    }
    return { label: `Due in ${diffDays} days`, colorClass: 'status-upcoming', isOverdue: false };
  };

  return (
    <TaskContext.Provider
      value={{
        user,
        tasks,
        loading,
        error,
        dashboardStats,
        notifications,
        unreadCount,
        focusStats,
        fetchTasks,
        fetchDashboardStats,
        fetchNotifications,
        fetchFocusStats,
        refreshAll,
        createTask,
        updateTask,
        deleteTask,
        toggleTask,
        recordFocusSession,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        requestNotificationPermission,
        getDeadlineStatus
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
