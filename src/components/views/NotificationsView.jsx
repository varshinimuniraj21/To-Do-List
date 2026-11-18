import React from 'react';
import { useAppearance } from '../../context/AppearanceContext';
import { useTasks } from '../../context/TaskContext';
import {
  Bell,
  Sparkles,
  CheckCheck,
  Clock,
  AlertTriangle,
  Trash2,
  Info,
  CheckCircle2
} from 'lucide-react';

export const NotificationsView = () => {
  const { activeSwatch, triggerToast } = useAppearance();
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    requestNotificationPermission
  } = useTasks();

  const handleRequestPerm = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      triggerToast('Browser notification permission enabled! 🔔');
    } else {
      triggerToast('Notifications are blocked in your browser settings.');
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'reminder':
        return Clock;
      case 'deadline':
        return AlertTriangle;
      case 'achievement':
        return Sparkles;
      default:
        return Bell;
    }
  };

  return (
    <div className="view-container">
      <div className="view-header-row">
        <div>
          <h1 className="view-title">Notifications Center</h1>
          <p className="view-subtitle">
            Real-time reminders, task deadlines, and system alerts from MongoDB
          </p>
        </div>

        <div className="notif-header-actions">
          {'Notification' in window && Notification.permission !== 'granted' && (
            <button
              type="button"
              className="primary-glass-btn small-btn"
              onClick={handleRequestPerm}
              style={{
                backgroundColor: activeSwatch.primary,
                boxShadow: `0 2px 8px ${activeSwatch.glow}`
              }}
            >
              <Bell size={14} />
              <span>Enable Browser Alerts</span>
            </button>
          )}

          {unreadCount > 0 && (
            <button
              type="button"
              className="secondary-glass-btn"
              onClick={() => {
                markAllNotificationsRead();
                triggerToast('All notifications marked as read');
              }}
            >
              <CheckCheck size={14} />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Explanatory Banner on Browser Notification Architecture & Limitations */}
      <div className="glass-card notif-info-banner">
        <div className="info-banner-left">
          <Info size={18} style={{ color: activeSwatch.primary }} />
        </div>
        <div className="info-banner-content">
          <h4>How Reminder Delivery Works</h4>
          <p>
            <strong>When the application is open or in background tabs:</strong> HTML5 Web Notifications trigger automatically at the exact scheduled reminder time via the backend scheduler.
          </p>
          <p className="info-sub">
            <strong>When the browser is closed:</strong> Web Notifications require an OS push notification service (VAPID/Web Push PWA). All reminders are permanently stored in MongoDB, ensuring your unread notification badges and history sync reliably across all devices.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-tasks-state glass-card">
            <CheckCircle2 size={36} style={{ color: activeSwatch.primary, margin: '0 auto 12px' }} />
            <h3>All caught up</h3>
            <p>You have no notifications or reminders at this time.</p>
          </div>
        ) : (
          notifications.map((item) => {
            const Icon = getNotifIcon(item.type);
            return (
              <div
                key={item._id}
                className={`notification-item-card glass-card ${!item.read ? 'unread' : ''}`}
                onClick={() => !item.read && markNotificationRead(item._id)}
              >
                <div
                  className="notif-icon-circle"
                  style={{
                    backgroundColor: item.type === 'deadline' ? 'rgba(239, 68, 68, 0.15)' : `${activeSwatch.primary}20`,
                    color: item.type === 'deadline' ? '#ef4444' : activeSwatch.primary
                  }}
                >
                  <Icon size={18} />
                </div>

                <div className="notif-content">
                  <div className="notif-title-row">
                    <h4 className="notif-title">{item.title}</h4>
                    <span className="notif-time">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="notif-desc">{item.message}</p>
                </div>

                <button
                  type="button"
                  className="notif-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(item._id);
                    triggerToast('Notification removed');
                  }}
                  title="Delete notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
