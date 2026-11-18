import React from 'react';
import { AppearanceProvider, useAppearance } from './context/AppearanceContext';
import { TaskProvider } from './context/TaskContext';
import { Background } from './components/Background';
import { Sidebar } from './components/Sidebar';
import { AppearanceSettings } from './components/AppearanceSettings';
import { DashboardView } from './components/views/DashboardView';
import { TasksView } from './components/views/TasksView';
import { CalendarView } from './components/views/CalendarView';
import { FocusTimerView } from './components/views/FocusTimerView';
import { HabitTrackerView } from './components/views/HabitTrackerView';
import { NotesView } from './components/views/NotesView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { NotificationsView } from './components/views/NotificationsView';
import { Toast } from './components/Toast';

const MainContent = () => {
  const { activeTab, settings } = useAppearance();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView />;
      case 'My Tasks':
        return <TasksView />;
      case 'Calendar':
        return <CalendarView />;
      case 'Focus Timer':
        return <FocusTimerView />;
      case 'Habit Tracker':
        return <HabitTrackerView />;
      case 'Notes':
        return <NotesView />;
      case 'Analytics':
        return <AnalyticsView />;
      case 'Notifications':
        return <NotificationsView />;
      case 'Settings':
      case 'Appearance':
      default:
        // By default, or on Appearance / Settings tabs, render the exact Appearance settings page from the screenshot
        return <AppearanceSettings />;
    }
  };

  return (
    <div className="app-viewport">
      {/* Dreamy watercolor background with golden sparkles */}
      <Background />

      {/* Main Glassmorphism Window Container */}
      <main
        className={`app-glass-window ${settings.highContrastOutlines ? 'high-contrast-outline' : ''}`}
        style={{
          borderRadius: `calc(var(--card-radius) + 12px)`
        }}
      >
        {/* Soft iridescent glow rim around the outer card */}
        <div className="window-glow-border" />

        {/* Left Translucent Glass Sidebar */}
        <Sidebar />

        {/* Center / Right Content Panel */}
        <div className="app-main-pane">
          {renderActiveView()}
        </div>
      </main>

      {/* Global Toast */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppearanceProvider>
      <TaskProvider>
        <MainContent />
      </TaskProvider>
    </AppearanceProvider>
  );
}
