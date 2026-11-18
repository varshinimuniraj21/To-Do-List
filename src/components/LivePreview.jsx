import React, { useState } from 'react';
import { useAppearance } from '../context/AppearanceContext';
import {
  Search,
  Plus,
  MoreHorizontal,
  Bell,
  Home,
  FolderKanban,
  CheckCircle2,
  Calendar as CalendarIcon,
  Timer,
  BarChart2,
  Maximize2,
  Sparkles,
  Play,
  RotateCcw
} from 'lucide-react';

export const LivePreview = () => {
  const { settings, activeSwatch, setActiveTab } = useAppearance();
  const [previewTab, setPreviewTab] = useState('tasks'); // 'tasks' | 'calendar' | 'timer'

  // Corner radius scaled for miniature preview
  const previewRadius = Math.max(4, Math.round(settings.cornerRadius * 0.7));
  const previewCardRadius = Math.max(4, Math.round(settings.cornerRadius * 0.55));
  const previewButtonRadius = Math.max(3, Math.round(settings.cornerRadius * 0.45));

  // Density scaling for preview
  const densityGap = 8 - (settings.density / 100) * 4; // 8px to 4px
  const densityPadding = 10 - (settings.density / 100) * 5; // 10px to 5px

  return (
    <div className="preview-container-outer">
      {/* Top Preview Controls / View switch */}
      <div className="preview-header-bar">
        <div className="preview-tabs">
          <button
            type="button"
            className={`preview-tab-btn ${previewTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setPreviewTab('tasks')}
          >
            Tasks
          </button>
          <button
            type="button"
            className={`preview-tab-btn ${previewTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setPreviewTab('calendar')}
          >
            Calendar
          </button>
          <button
            type="button"
            className={`preview-tab-btn ${previewTab === 'timer' ? 'active' : ''}`}
            onClick={() => setPreviewTab('timer')}
          >
            Timer
          </button>
        </div>

        <button
          type="button"
          className="open-full-dashboard-btn"
          onClick={() => setActiveTab('Dashboard')}
          title="Open Full Dashboard Mode"
        >
          <Maximize2 size={12} />
          <span>Full View</span>
        </button>
      </div>

      {/* Miniature Dashboard Frame - exactly reproducing the screenshot */}
      <div
        className={`mini-dashboard-frame ${settings.highContrastOutlines ? 'high-contrast' : ''}`}
        style={{
          borderRadius: `${previewRadius + 6}px`,
          fontFamily: `'${settings.font}', sans-serif`,
          boxShadow: `0 16px 40px rgba(160, 140, 200, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.7), 0 0 24px ${activeSwatch.glow}`
        }}
      >
        {/* Glow rim aura around the preview window matching the screenshot */}
        <div
          className="preview-glow-halo"
          style={{
            borderColor: activeSwatch.haloColor,
            borderRadius: `${previewRadius + 8}px`
          }}
        />

        {/* Mini Sidebar */}
        <aside
          className="mini-sidebar"
          style={{
            borderTopLeftRadius: `${previewRadius + 6}px`,
            borderBottomLeftRadius: `${previewRadius + 6}px`
          }}
        >
          {/* Mini Brand & Bell */}
          <div className="mini-sidebar-header">
            <div className="mini-team-brand">
              <div
                className="mini-team-orb"
                style={{
                  background: activeSwatch.preview
                }}
              />
              <span className="mini-team-name">Team</span>
            </div>
            <Bell size={11} className="mini-bell-icon" />
          </div>

          {/* Mini Nav Links */}
          <div className="mini-nav-group">
            <div
              className="mini-nav-item is-active"
              style={{
                borderRadius: `${previewButtonRadius}px`,
                backgroundColor: 'rgba(255, 255, 255, 0.65)'
              }}
            >
              <Home size={settings.useLargeSidebarIcons ? 13 : 11} />
              <span>Home</span>
            </div>
            <div className="mini-nav-item">
              <FolderKanban size={settings.useLargeSidebarIcons ? 13 : 11} />
              <span>Projects</span>
            </div>
          </div>

          {/* Mini Projects List */}
          <div className="mini-section-group">
            <div className="mini-section-header">
              <span>Projects</span>
              <Plus size={10} className="mini-plus" />
            </div>
            <ul className="mini-project-list">
              <li className="mini-project-item">
                <span className="mini-dot" style={{ backgroundColor: activeSwatch.primary }} />
                <span>Project 1</span>
              </li>
              <li className="mini-project-item">
                <span className="mini-dot" style={{ backgroundColor: '#fb923c' }} />
                <span>Marketing</span>
              </li>
              <li className="mini-project-item">
                <span className="mini-dot" style={{ backgroundColor: '#2dd4bf' }} />
                <span>Design System</span>
              </li>
            </ul>
          </div>

          {/* Mini Tags List */}
          <div className="mini-section-group">
            <div className="mini-section-header">
              <span>Tags</span>
              <Plus size={10} className="mini-plus" />
            </div>
            <div className="mini-tags-pills">
              <span className="mini-tag-pill" style={{ borderRadius: `${previewButtonRadius}px` }}>#focus</span>
              <span className="mini-tag-pill" style={{ borderRadius: `${previewButtonRadius}px` }}>#urgent</span>
            </div>
          </div>
        </aside>

        {/* Mini Content Area */}
        <main className="mini-content-area">
          {/* Mini Header Bar */}
          <header className="mini-header-bar">
            <div className="mini-search-field" style={{ borderRadius: `${previewButtonRadius}px` }}>
              <Search size={11} className="mini-search-icon" />
              <input type="text" placeholder="Search" readOnly className="mini-search-input" />
            </div>

            <div className="mini-header-actions">
              <div className="mini-project-selector" style={{ borderRadius: `${previewButtonRadius}px` }}>
                <span>Project</span>
                <span className="mini-chevron">▾</span>
              </div>

              <button
                type="button"
                className="mini-new-task-btn"
                style={{
                  borderRadius: `${previewButtonRadius}px`,
                  backgroundColor: activeSwatch.primary,
                  boxShadow: `0 2px 8px ${activeSwatch.glow}`
                }}
              >
                <Plus size={11} />
                <span>New task</span>
              </button>

              <button type="button" className="mini-more-btn">
                <MoreHorizontal size={12} />
              </button>
            </div>
          </header>

          {/* Dynamic Preview Tabs */}
          {previewTab === 'tasks' && (
            <div className="mini-kanban-body" style={{ gap: `${densityGap}px` }}>
              <div className="mini-column-header">
                <div className="col-title-badge">
                  <span className="col-name">New task</span>
                  <span className="col-count">3</span>
                </div>
                <MoreHorizontal size={11} className="mini-col-more" />
              </div>

              {/* Task Cards - exactly styled like reference image */}
              <div className="mini-cards-stack" style={{ gap: `${densityGap}px` }}>
                {/* Card 1 */}
                <div
                  className={`mini-task-card ${settings.showRowDividers ? 'has-divider' : ''}`}
                  style={{
                    borderRadius: `${previewCardRadius}px`,
                    padding: `${densityPadding}px`
                  }}
                >
                  <div className="mini-card-skeleton-lines">
                    <div className="skeleton-line full" />
                    <div className="skeleton-line half" />
                  </div>
                  <div className="mini-card-footer">
                    <div className="mini-avatars-row">
                      <div className="mini-avatar" style={{ backgroundColor: '#f472b6' }}>VM</div>
                      <div className="mini-avatar" style={{ backgroundColor: '#38bdf8' }}>AI</div>
                    </div>
                    <span
                      className="mini-card-badge"
                      style={{
                        borderRadius: `${previewButtonRadius}px`,
                        backgroundColor: 'rgba(254, 240, 138, 0.45)',
                        color: '#854d0e'
                      }}
                    >
                      0 12
                    </span>
                  </div>
                </div>

                {/* Card 2 */}
                <div
                  className={`mini-task-card ${settings.showRowDividers ? 'has-divider' : ''}`}
                  style={{
                    borderRadius: `${previewCardRadius}px`,
                    padding: `${densityPadding}px`
                  }}
                >
                  <div className="mini-card-skeleton-lines">
                    <div className="skeleton-line three-quarter" />
                    <div
                      className="mini-progress-track"
                      style={{ borderRadius: `${previewButtonRadius}px` }}
                    >
                      <div
                        className="mini-progress-fill"
                        style={{
                          width: '68%',
                          backgroundColor: activeSwatch.primary,
                          borderRadius: `${previewButtonRadius}px`
                        }}
                      />
                    </div>
                  </div>
                  <div className="mini-card-footer">
                    <div className="mini-avatars-row">
                      <div className="mini-avatar" style={{ backgroundColor: '#818cf8' }}>JD</div>
                    </div>
                    <span
                      className="mini-card-badge"
                      style={{
                        borderRadius: `${previewButtonRadius}px`,
                        backgroundColor: 'rgba(224, 231, 255, 0.65)',
                        color: '#4338ca'
                      }}
                    >
                      16
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {previewTab === 'calendar' && (
            <div className="mini-calendar-preview">
              <div className="mini-calendar-month">
                <span>November 2026</span>
              </div>
              <div className="mini-calendar-grid">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} className="mini-cal-header">{d}</span>
                ))}
                {Array.from({ length: 28 }).map((_, i) => (
                  <span
                    key={i}
                    className={`mini-cal-cell ${i === 16 ? 'active-day' : ''}`}
                    style={i === 16 ? { backgroundColor: activeSwatch.primary, color: '#fff', borderRadius: '4px' } : {}}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>
          )}

          {previewTab === 'timer' && (
            <div className="mini-timer-preview">
              <div className="mini-timer-ring" style={{ borderColor: activeSwatch.primary }}>
                <span className="mini-timer-digits">25:00</span>
                <span className="mini-timer-state">Focus</span>
              </div>
              <div className="mini-timer-actions">
                <button
                  type="button"
                  className="mini-timer-action-btn"
                  style={{
                    backgroundColor: activeSwatch.primary,
                    borderRadius: `${previewButtonRadius}px`
                  }}
                >
                  <Play size={10} fill="currentColor" />
                  <span>Start</span>
                </button>
              </div>
            </div>
          )}

          {/* Floating toast notification matching reference image: "👏 Saved to this device" */}
          <div
            className="mini-saved-toast"
            style={{
              borderRadius: `${previewButtonRadius + 4}px`
            }}
          >
            <span className="toast-clap-emoji">👏</span>
            <span className="toast-text">Saved to this device</span>
          </div>
        </main>
      </div>

      <div className="preview-caption">
        <Sparkles size={13} className="sparkle-icon" />
        <span>Live reactive preview · Updates in real time</span>
      </div>
    </div>
  );
};
