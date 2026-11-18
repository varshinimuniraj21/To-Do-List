import React, { useState } from 'react';
import { useAppearance } from '../../context/AppearanceContext';
import { useTasks } from '../../context/TaskContext';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Plus,
  Calendar,
  Flame,
  ArrowRight,
  AlertTriangle,
  Bell,
  Check
} from 'lucide-react';

export const DashboardView = () => {
  const { activeSwatch, setActiveTab } = useAppearance();
  const {
    tasks,
    dashboardStats,
    toggleTask,
    createTask,
    getDeadlineStatus
  } = useTasks();

  const [quickTitle, setQuickTitle] = useState('');
  const [quickDate, setQuickDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    await createTask({
      title: quickTitle.trim(),
      dueDate: quickDate,
      dueTime: '18:00',
      priority: 'Medium',
      category: 'General'
    });

    setQuickTitle('');
  };

  // Extract dynamic MongoDB stats (fallback to current loaded tasks)
  const totalTasks = dashboardStats ? dashboardStats.totalTasks : tasks.length;
  const completedTasks = dashboardStats
    ? dashboardStats.completedTasks
    : tasks.filter((t) => t.completed).length;
  const pendingTasks = dashboardStats
    ? dashboardStats.pendingTasks
    : tasks.filter((t) => !t.completed).length;
  const completionRate = dashboardStats
    ? dashboardStats.completionRate
    : totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  const todayTasks = dashboardStats?.todayTasks || tasks.filter((t) => {
    const today = new Date().toISOString().split('T')[0];
    return t.dueDate && t.dueDate.startsWith(today);
  });

  const overdueTasks = dashboardStats?.overdueTasks || [];
  const upcomingTasks = dashboardStats?.upcomingTasks || [];
  const upcomingReminders = dashboardStats?.upcomingReminders || [];
  const todayFocusMinutes = dashboardStats?.todayFocusMinutes || 0;

  return (
    <div className="view-container">
      {/* Dynamic Welcome Banner */}
      <div className="view-banner-card">
        <div className="banner-content">
          <div className="banner-badge">
            <Sparkles size={14} />
            <span>Real-Time Productivity Hub</span>
          </div>
          <h1 className="banner-title">Welcome back, Varshini ✨</h1>
          <p className="banner-desc">
            {pendingTasks === 0 && totalTasks > 0
              ? 'Incredible work! You have completed all your pending tasks.'
              : totalTasks === 0
              ? 'Your dashboard is fresh and clean. Add your first goal to get started!'
              : `You have ${pendingTasks} active task${pendingTasks === 1 ? '' : 's'} in progress. Stay in your watercolor flow.`}
          </p>
          <div className="banner-actions">
            <button
              type="button"
              className="primary-glass-btn"
              onClick={() => setActiveTab('My Tasks')}
              style={{
                backgroundColor: activeSwatch.primary,
                boxShadow: `0 4px 14px ${activeSwatch.glow}`
              }}
            >
              <span>Manage Tasks ({pendingTasks})</span>
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              className="secondary-glass-btn"
              onClick={() => setActiveTab('Calendar')}
            >
              <span>Calendar View</span>
            </button>
          </div>
        </div>

        {/* Dynamic completion metrics from MongoDB */}
        <div className="banner-stats-pill">
          <div className="stat-item">
            <span className="stat-number">{completionRate}%</span>
            <span className="stat-label">Completion</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">{todayFocusMinutes}m</span>
            <span className="stat-label">Focus Today</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">{completedTasks}/{totalTasks}</span>
            <span className="stat-label">Tasks Done</span>
          </div>
        </div>
      </div>

      {/* Overdue Tasks Alert (if any) */}
      {overdueTasks.length > 0 && (
        <div className="glass-card overdue-banner-alert">
          <div className="overdue-alert-header">
            <AlertTriangle size={18} className="overdue-icon" />
            <span className="overdue-title">
              {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''} Need Attention
            </span>
          </div>
          <div className="overdue-tasks-chips">
            {overdueTasks.map((t) => (
              <div key={t._id} className="overdue-chip" onClick={() => setActiveTab('My Tasks')}>
                <span className="chip-task-name">{t.title}</span>
                <span className="chip-due-date">Due: {new Date(t.dueDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Key Real-Time Widgets */}
      <div className="dashboard-widgets-grid">
        {/* Widget 1: Today's Tasks */}
        <div className="glass-card widget-card">
          <div className="widget-header">
            <div className="widget-title-group">
              <CheckCircle2 size={18} style={{ color: activeSwatch.primary }} />
              <h3>Today's Tasks ({todayTasks.length})</h3>
            </div>
            <button
              type="button"
              className="text-link-btn"
              onClick={() => setActiveTab('My Tasks')}
            >
              View all
            </button>
          </div>

          {/* Quick Task Creator Form */}
          <form onSubmit={handleQuickAdd} className="quick-add-form">
            <div className="quick-add-input-group">
              <input
                type="text"
                placeholder="+ Add a quick task for today..."
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="glass-input"
              />
              <button
                type="submit"
                className="quick-add-btn"
                disabled={!quickTitle.trim()}
                style={{ backgroundColor: activeSwatch.primary }}
              >
                <Plus size={14} color="#fff" />
              </button>
            </div>
          </form>

          {/* Today's Tasks List */}
          {todayTasks.length === 0 ? (
            <div className="empty-widget-state">
              <Calendar size={28} className="empty-widget-icon" />
              <p>No tasks scheduled for today.</p>
              <span className="empty-widget-sub">Add a task above or plan from Calendar.</span>
            </div>
          ) : (
            <ul className="widget-task-list">
              {todayTasks.map((task) => {
                const status = getDeadlineStatus(task);
                return (
                  <li
                    key={task._id}
                    className={`task-row-item ${task.completed ? 'is-done' : ''}`}
                    onClick={() => toggleTask(task._id)}
                  >
                    <div className={`custom-checkbox ${task.completed ? 'checked' : ''}`}
                      style={task.completed ? { backgroundColor: activeSwatch.primary, borderColor: activeSwatch.primary } : {}}
                    >
                      {task.completed && <Check size={12} color="#fff" strokeWidth={3} />}
                    </div>
                    <div className="task-row-info">
                      <span className="task-row-title">{task.title}</span>
                      <span className={`task-deadline-badge ${status.colorClass}`}>
                        {task.dueTime ? `${task.dueTime} · ` : ''}{status.label}
                      </span>
                    </div>
                    <span className="task-tag-pill">{task.category}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Widget 2: Focus Time & Deep Work */}
        <div className="glass-card widget-card">
          <div className="widget-header">
            <div className="widget-title-group">
              <Clock size={18} style={{ color: activeSwatch.primary }} />
              <h3>Focus Session</h3>
            </div>
            <button
              type="button"
              className="text-link-btn"
              onClick={() => setActiveTab('Focus Timer')}
            >
              Open Timer
            </button>
          </div>

          <div className="dashboard-timer-display">
            <div
              className="dash-timer-circle"
              style={{
                borderColor: activeSwatch.primary,
                boxShadow: `0 0 24px ${activeSwatch.glow}`
              }}
            >
              <span className="timer-huge-text">25:00</span>
              <span className="timer-mode-tag">Deep Flow</span>
            </div>
            <div className="dash-focus-summary">
              <span className="focus-today-stat">
                <strong>{todayFocusMinutes} mins</strong> focused today
              </span>
              <span className="dash-timer-quote">
                "Small daily disciplines compound into extraordinary watercolor masterpieces."
              </span>
            </div>
          </div>
        </div>

        {/* Widget 3: Upcoming Deadlines & Reminders */}
        <div className="glass-card widget-card">
          <div className="widget-header">
            <div className="widget-title-group">
              <Bell size={18} style={{ color: '#f59e0b' }} />
              <h3>Upcoming Deadlines</h3>
            </div>
            <button
              type="button"
              className="text-link-btn"
              onClick={() => setActiveTab('Calendar')}
            >
              Schedule
            </button>
          </div>

          {upcomingTasks.length === 0 && upcomingReminders.length === 0 ? (
            <div className="empty-widget-state">
              <Sparkles size={28} className="empty-widget-icon" />
              <p>No upcoming deadlines this week.</p>
              <span className="empty-widget-sub">You have complete peace of mind.</span>
            </div>
          ) : (
            <div className="upcoming-deadlines-stack">
              {upcomingTasks.slice(0, 4).map((task) => {
                const status = getDeadlineStatus(task);
                return (
                  <div key={task._id} className="upcoming-item-row">
                    <div className="upcoming-item-title-group">
                      <span className="upcoming-item-title">{task.title}</span>
                      <span className="upcoming-item-date">
                        📅 {new Date(task.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        {task.dueTime ? ` at ${task.dueTime}` : ''}
                      </span>
                    </div>
                    <span className={`upcoming-item-status ${status.colorClass}`}>
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
