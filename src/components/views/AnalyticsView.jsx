import React from 'react';
import { useAppearance } from '../../context/AppearanceContext';
import { BarChart3, TrendingUp, CheckCircle, Clock, Award, Sparkles } from 'lucide-react';

export const AnalyticsView = () => {
  const { activeSwatch } = useAppearance();

  const days = [
    { name: 'Mon', completed: 8, target: 10 },
    { name: 'Tue', completed: 11, target: 10 },
    { name: 'Wed', completed: 9, target: 10 },
    { name: 'Thu', completed: 12, target: 10 },
    { name: 'Fri', completed: 14, target: 10 },
    { name: 'Sat', completed: 6, target: 8 },
    { name: 'Sun', completed: 7, target: 8 }
  ];

  return (
    <div className="view-container">
      <div className="view-header-row">
        <div>
          <h1 className="view-title">Analytics</h1>
          <p className="view-subtitle">Weekly completion velocity and productivity patterns</p>
        </div>
      </div>

      <div className="analytics-metrics-row">
        <div className="glass-card metric-pill-card">
          <div className="metric-icon-box" style={{ color: activeSwatch.primary }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="metric-value">67</span>
            <span className="metric-label">Tasks Completed</span>
          </div>
        </div>

        <div className="glass-card metric-pill-card">
          <div className="metric-icon-box" style={{ color: '#06b6d4' }}>
            <Clock size={20} />
          </div>
          <div>
            <span className="metric-value">28.5 hrs</span>
            <span className="metric-label">Deep Focus Time</span>
          </div>
        </div>

        <div className="glass-card metric-pill-card">
          <div className="metric-icon-box" style={{ color: '#ec4899' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="metric-value">+18%</span>
            <span className="metric-label">Vs Last Week</span>
          </div>
        </div>
      </div>

      <div className="glass-card chart-main-card">
        <div className="chart-header">
          <h3>Daily Task Velocity</h3>
          <span className="chart-legend">
            <span className="legend-dot" style={{ backgroundColor: activeSwatch.primary }} />
            Completed Tasks
          </span>
        </div>

        <div className="bar-chart-container">
          {days.map((d) => {
            const heightPercent = Math.min(100, Math.round((d.completed / 15) * 100));
            return (
              <div key={d.name} className="chart-bar-column">
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: activeSwatch.primary,
                      boxShadow: `0 0 12px ${activeSwatch.glow}`
                    }}
                  />
                </div>
                <span className="bar-count-label">{d.completed}</span>
                <span className="bar-day-name">{d.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
