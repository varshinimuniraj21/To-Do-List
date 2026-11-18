import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Timer,
  Flame,
  FileText,
  BarChart3,
  Bell,
  Settings,
  Paintbrush,
  User,
  Layers,
  Shield,
  Puzzle,
  CreditCard,
  Keyboard,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useAppearance } from '../context/AppearanceContext';
import { useTasks } from '../context/TaskContext';

export const Sidebar = () => {
  const { activeTab, setActiveTab, settings } = useAppearance();
  const { tasks, unreadCount } = useTasks();
  const [navMode, setNavMode] = useState('full'); // 'full' (Productivity) or 'settings' (Preferences)

  const activeTasksCount = tasks.filter((t) => !t.completed).length;

  // Primary navigation items requested by USER:
  // Dashboard, Calendar, My Tasks, Focus Timer, Habit Tracker, Notes, Analytics, Notifications, Settings (Appearance)
  const mainNavItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Calendar', label: 'Calendar', icon: Calendar },
    { id: 'My Tasks', label: 'My Tasks', icon: CheckSquare, badge: activeTasksCount > 0 ? String(activeTasksCount) : null },
    { id: 'Focus Timer', label: 'Focus Timer', icon: Timer },
    { id: 'Habit Tracker', label: 'Habit Tracker', icon: Flame },
    { id: 'Notes', label: 'Notes', icon: FileText },
    { id: 'Analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'Notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? String(unreadCount) : null },
    { id: 'Appearance', label: 'Appearance', icon: Paintbrush, isHighlightedDefault: true },
    { id: 'Settings', label: 'Settings', icon: Settings }
  ];

  // Additional settings items from the screenshot if user switches to Settings-specific mode
  const settingsNavItems = [
    { id: 'Account', label: 'Account', icon: User },
    { id: 'Workspace', label: 'Workspace', icon: Layers },
    { id: 'Notifications', label: 'Notifications', icon: Bell, badge: unreadCount > 0 ? String(unreadCount) : null },
    { id: 'Privacy', label: 'Privacy', icon: Shield },
    { id: 'Appearance', label: 'Appearance', icon: Paintbrush },
    { id: 'Integrations', label: 'Integrations', icon: Puzzle },
    { id: 'Billing', label: 'Billing', icon: CreditCard },
    { id: 'Keyboard', label: 'Keyboard', icon: Keyboard },
    { id: 'Advanced', label: 'Advanced', icon: Sliders }
  ];

  const currentItems = navMode === 'settings' ? settingsNavItems : mainNavItems;
  const iconSize = settings.useLargeSidebarIcons ? 22 : 18;

  return (
    <aside className="app-sidebar">
      {/* Top Brand / Iridescent Orb avatar matching screenshot */}
      <div className="sidebar-brand-wrapper">
        <div className="sidebar-brand-orb" title="Lumina Tasklist">
          <div className="orb-inner-shimmer" />
          <Sparkles className="orb-icon" size={16} />
        </div>
        <div className="sidebar-brand-info">
          <span className="brand-title">Lumina</span>
          <span className="brand-subtitle">Productivity Dashboard</span>
        </div>
      </div>

      {/* Mode toggle pill (Productivity vs Preferences) */}
      <div className="sidebar-mode-switch">
        <button
          type="button"
          className={`mode-btn ${navMode === 'full' ? 'active' : ''}`}
          onClick={() => setNavMode('full')}
          title="Productivity Suite"
        >
          Productivity
        </button>
        <button
          type="button"
          className={`mode-btn ${navMode === 'settings' ? 'active' : ''}`}
          onClick={() => {
            setNavMode('settings');
            setActiveTab('Appearance');
          }}
          title="Settings Menu"
        >
          Preferences
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <ul className="sidebar-nav-list">
          {currentItems.map((item) => {
            const Icon = item.icon;
            const isSelected =
              activeTab === item.id ||
              (item.id === 'Settings' && activeTab === 'Appearance') ||
              (item.id === 'Appearance' && activeTab === 'Settings');

            return (
              <li key={item.id} className="sidebar-nav-item">
                <button
                  type="button"
                  className={`sidebar-nav-link ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setActiveTab(item.id === 'Settings' ? 'Appearance' : item.id)}
                >
                  <Icon
                    size={iconSize}
                    className={`nav-item-icon ${isSelected ? 'icon-selected' : ''}`}
                    strokeWidth={isSelected ? 2.2 : 1.75}
                  />
                  <span className="nav-item-label">{item.label}</span>

                  {item.badge && !isSelected && (
                    <span className="nav-item-badge">{item.badge}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom User/Sync Status Card */}
      <div className="sidebar-footer">
        <div className="sidebar-user-pill">
          <div className="user-avatar-dot" />
          <div className="user-info-text">
            <span className="user-name">Varshini M.</span>
            <span className="user-status">MongoDB Connected 🟢</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
