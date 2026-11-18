import React, { useState } from 'react';
import { useAppearance } from '../../context/AppearanceContext';
import { useTasks } from '../../context/TaskContext';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  Tag,
  X,
  Check
} from 'lucide-react';

export const CalendarView = () => {
  const { activeSwatch, triggerToast } = useAppearance();
  const { tasks, createTask, updateTask, toggleTask, getDeadlineStatus } = useTasks();

  // Navigation state: current displayed Year and Month (0-indexed)
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'

  // Task creation/edit modal from calendar
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalTime, setModalTime] = useState('18:00');
  const [modalPriority, setModalPriority] = useState('Medium');
  const [modalCategory, setModalCategory] = useState('Work');

  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate Previous Month
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Navigate Next Month
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Navigate to Today
  const handleGoToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  // Calculate days in month (accurately handles leap years via Date constructor)
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const daysInCurrentMonth = getDaysInMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(year, month - 1);

  // Day of week offset for the 1st day (0 = Sunday)
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Filter tasks for a specific year, month, day
  const getTasksForDate = (y, m, d) => {
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      const td = new Date(t.dueDate);
      return (
        td.getFullYear() === y &&
        td.getMonth() === m &&
        td.getDate() === d
      );
    });
  };

  // Selected date's tasks
  const selectedDayTasks = getTasksForDate(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  );

  // Quick Add task from calendar
  const handleAddFromCalendar = async (e) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    const res = await createTask({
      title: modalTitle.trim(),
      dueDate: formattedDate,
      dueTime: modalTime,
      priority: modalPriority,
      category: modalCategory
    });

    if (res.success) {
      triggerToast('Task scheduled on calendar');
      setModalTitle('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="view-container calendar-view-page">
      {/* Header Row */}
      <div className="view-header-row">
        <div>
          <h1 className="view-title">Calendar</h1>
          <p className="view-subtitle">Deadlines, schedule velocity, and milestone planning</p>
        </div>

        {/* View Mode & Month Navigation */}
        <div className="cal-header-actions">
          {/* View Mode Pills (Monthly, Weekly, Daily) */}
          <div className="cal-view-modes">
            <button
              type="button"
              className={`mode-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button
              type="button"
              className={`mode-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button
              type="button"
              className={`mode-btn ${viewMode === 'day' ? 'active' : ''}`}
              onClick={() => setViewMode('day')}
            >
              Day
            </button>
          </div>

          {/* Navigation Controls: Prev, Today, Next */}
          <div className="cal-nav-buttons">
            <button
              type="button"
              className="cal-arrow-btn"
              onClick={handlePrevMonth}
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              className="cal-today-pill"
              onClick={handleGoToday}
              title="Return to Current Month"
            >
              Today
            </button>

            <span className="cal-current-month">
              {monthNames[month]} {year}
            </span>

            <button
              type="button"
              className="cal-arrow-btn"
              onClick={handleNextMonth}
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Layout */}
      <div className="calendar-grid-layout">
        {/* Left Side: Calendar Grid Sheet */}
        <div className="glass-card calendar-sheet">
          {viewMode === 'month' && (
            <>
              {/* Days of Week Header */}
              <div className="days-header-row">
                {daysOfWeek.map((day) => (
                  <span key={day} className="day-header-cell">{day}</span>
                ))}
              </div>

              {/* Monthly Day Cells */}
              <div className="days-cells-grid">
                {/* Previous month overflow cells */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => {
                  const prevDayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
                  return (
                    <div
                      key={`prev-${i}`}
                      className="day-cell is-muted"
                      onClick={() => {
                        setCurrentDate(new Date(year, month - 1, 1));
                        setSelectedDate(new Date(year, month - 1, prevDayNum));
                      }}
                    >
                      <span className="cell-day-num">{prevDayNum}</span>
                    </div>
                  );
                })}

                {/* Current month cells */}
                {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isSelected =
                    selectedDate.getFullYear() === year &&
                    selectedDate.getMonth() === month &&
                    selectedDate.getDate() === dayNum;

                  const isCurrentDay =
                    today.getFullYear() === year &&
                    today.getMonth() === month &&
                    today.getDate() === dayNum;

                  const dateTasks = getTasksForDate(year, month, dayNum);
                  const hasTasks = dateTasks.length > 0;

                  return (
                    <div
                      key={dayNum}
                      className={`day-cell ${isSelected ? 'is-selected' : ''} ${isCurrentDay ? 'is-today' : ''} ${hasTasks ? 'has-events' : ''}`}
                      onClick={() => setSelectedDate(new Date(year, month, dayNum))}
                      style={
                        isSelected
                          ? {
                              backgroundColor: activeSwatch.primary,
                              color: '#fff',
                              boxShadow: `0 4px 14px ${activeSwatch.glow}`
                            }
                          : {}
                      }
                    >
                      <div className="cell-top-row">
                        <span className="cell-day-num">{dayNum}</span>
                        {hasTasks && (
                          <span
                            className="cell-task-counter"
                            style={isSelected ? { backgroundColor: 'rgba(255,255,255,0.3)', color: '#fff' } : {}}
                          >
                            {dateTasks.length}
                          </span>
                        )}
                      </div>

                      {/* Miniature preview chips for scheduled tasks */}
                      {hasTasks && (
                        <div className="cell-tasks-dots-row">
                          {dateTasks.slice(0, 2).map((t) => (
                            <div
                              key={t._id}
                              className={`mini-cell-chip ${t.completed ? 'completed' : ''}`}
                              title={`${t.title} (${t.dueTime || 'No time'})`}
                            >
                              <span className="mini-chip-dot" />
                              <span className="mini-chip-title">{t.title}</span>
                            </div>
                          ))}
                          {dateTasks.length > 2 && (
                            <span className="mini-chip-more">+{dateTasks.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {viewMode === 'week' && (
            <div className="cal-weekly-view">
              <div className="weekly-header-row">
                {Array.from({ length: 7 }).map((_, idx) => {
                  const startOfWeek = new Date(selectedDate);
                  startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay() + idx);
                  const isSel = selectedDate.getDate() === startOfWeek.getDate() && selectedDate.getMonth() === startOfWeek.getMonth();
                  const weekTasks = getTasksForDate(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());

                  return (
                    <div
                      key={idx}
                      className={`weekly-col ${isSel ? 'active' : ''}`}
                      onClick={() => setSelectedDate(startOfWeek)}
                    >
                      <span className="weekly-day-name">{daysOfWeek[idx]}</span>
                      <span className="weekly-day-num">{startOfWeek.getDate()}</span>
                      <div className="weekly-tasks-list">
                        {weekTasks.map((t) => (
                          <div key={t._id} className="weekly-task-pill" onClick={() => setSelectedTaskDetails(t)}>
                            <span className="time">{t.dueTime}</span>
                            <span className="title">{t.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'day' && (
            <div className="cal-daily-view">
              <div className="daily-view-header">
                <h3>{selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
              </div>
              <div className="daily-hourly-timeline">
                {['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'].map((timeSlot) => (
                  <div key={timeSlot} className="timeline-slot">
                    <span className="slot-time">{timeSlot}</span>
                    <div className="slot-content">
                      {selectedDayTasks
                        .filter((t) => t.dueTime && t.dueTime.startsWith(timeSlot.slice(0, 2)))
                        .map((t) => (
                          <div key={t._id} className="slot-task-card" onClick={() => setSelectedTaskDetails(t)}>
                            <span className="task-title">{t.title}</span>
                            <span className="task-tag">{t.category}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Selected Day Agenda & Quick Add */}
        <div className="glass-card day-agenda-sheet">
          <div className="agenda-header">
            <div>
              <h3>Agenda for {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</h3>
              <span className="agenda-count">{selectedDayTasks.length} task{selectedDayTasks.length === 1 ? '' : 's'} scheduled</span>
            </div>

            <button
              type="button"
              className="primary-glass-btn small-btn"
              onClick={() => setShowAddModal(true)}
              style={{
                backgroundColor: activeSwatch.primary,
                boxShadow: `0 2px 8px ${activeSwatch.glow}`
              }}
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>

          {/* Agenda tasks list */}
          <div className="agenda-events-list">
            {selectedDayTasks.length === 0 ? (
              <div className="no-events-state">
                <CalendarIcon size={32} className="no-events-icon" />
                <p>No tasks scheduled for this day.</p>
                <button
                  type="button"
                  className="text-link-btn"
                  onClick={() => setShowAddModal(true)}
                >
                  + Add task for {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </button>
              </div>
            ) : (
              selectedDayTasks.map((t) => {
                const status = getDeadlineStatus(t);
                return (
                  <div
                    key={t._id}
                    className={`agenda-event-card ${t.completed ? 'completed' : ''}`}
                    onClick={() => setSelectedTaskDetails(t)}
                  >
                    <div className="agenda-event-top">
                      <div className="event-time">
                        <Clock size={12} />
                        <span>{t.dueTime || 'Anytime'}</span>
                      </div>
                      <span className={`agenda-status-pill ${status.colorClass}`}>
                        {status.label}
                      </span>
                    </div>

                    <span className="agenda-event-title">{t.title}</span>

                    <div className="agenda-event-bottom">
                      <span className="agenda-event-cat">{t.category}</span>
                      <span className={`agenda-priority priority-${t.priority.toLowerCase()}`}>
                        {t.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Task Directly From Calendar Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="glass-card modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <h3>Schedule Task for {selectedDate.toLocaleDateString()}</h3>
              <button type="button" className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddFromCalendar} className="full-task-form">
              <div className="form-group">
                <label>Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Sprint Deliverables Demo"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  required
                  autoFocus
                  className="glass-input"
                />
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label>Due Time</label>
                  <input
                    type="time"
                    value={modalTime}
                    onChange={(e) => setModalTime(e.target.value)}
                    className="glass-input"
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={modalPriority}
                    onChange={(e) => setModalPriority(e.target.value)}
                    className="glass-select full-width"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value)}
                    className="glass-select full-width"
                  >
                    <option value="Work">Work</option>
                    <option value="Design">Design</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>

              <div className="form-actions-row">
                <button
                  type="submit"
                  className="primary-glass-btn"
                  style={{
                    backgroundColor: activeSwatch.primary,
                    boxShadow: `0 4px 14px ${activeSwatch.glow}`
                  }}
                >
                  <Plus size={15} />
                  <span>Add to Calendar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTaskDetails && (
        <div className="modal-backdrop" onClick={() => setSelectedTaskDetails(null)}>
          <div className="glass-card modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <h3>Task Details</h3>
              <button type="button" className="close-btn" onClick={() => setSelectedTaskDetails(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="task-details-content">
              <h2 className="detail-title">{selectedTaskDetails.title}</h2>
              {selectedTaskDetails.description && (
                <p className="detail-desc">{selectedTaskDetails.description}</p>
              )}

              <div className="detail-meta-grid">
                <div className="detail-meta-item">
                  <span className="label">Due Date</span>
                  <span className="val">📅 {new Date(selectedTaskDetails.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-meta-item">
                  <span className="label">Due Time</span>
                  <span className="val">⏰ {selectedTaskDetails.dueTime || 'Anytime'}</span>
                </div>
                <div className="detail-meta-item">
                  <span className="label">Priority</span>
                  <span className="val">{selectedTaskDetails.priority}</span>
                </div>
                <div className="detail-meta-item">
                  <span className="label">Category</span>
                  <span className="val">{selectedTaskDetails.category}</span>
                </div>
                <div className="detail-meta-item">
                  <span className="label">Status</span>
                  <span className="val">{selectedTaskDetails.completed ? 'Completed' : 'Pending'}</span>
                </div>
              </div>

              <div className="detail-actions-row">
                <button
                  type="button"
                  className="primary-glass-btn"
                  onClick={() => {
                    toggleTask(selectedTaskDetails._id);
                    setSelectedTaskDetails({
                      ...selectedTaskDetails,
                      completed: !selectedTaskDetails.completed
                    });
                  }}
                  style={{ backgroundColor: activeSwatch.primary }}
                >
                  <Check size={15} />
                  <span>{selectedTaskDetails.completed ? 'Mark Incomplete' : 'Mark Completed'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
