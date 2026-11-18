import React, { useState } from 'react';
import { useAppearance } from '../../context/AppearanceContext';
import { useTasks } from '../../context/TaskContext';
import {
  Plus,
  CheckCircle2,
  Trash2,
  Edit3,
  Calendar as CalendarIcon,
  Clock,
  Bell,
  Search,
  Filter,
  Check,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TasksView = () => {
  const { settings, activeSwatch, triggerToast } = useAppearance();
  const {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    getDeadlineStatus,
    requestNotificationPermission
  } = useTasks();

  // Filters & Search
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // New Task Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('18:00');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Work');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderType, setReminderType] = useState('15m');
  const [customReminderTime, setCustomReminderTime] = useState('');

  // Edit Modal State
  const [editingTask, setEditingTask] = useState(null);

  const categories = ['All', 'Work', 'Design', 'Engineering', 'Personal', 'Research', 'General'];
  const priorities = ['All', 'High', 'Medium', 'Low'];

  // Handle Create Task
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    if (reminderEnabled) {
      await requestNotificationPermission();
    }

    const res = await createTask({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      dueTime,
      priority,
      category,
      reminder: {
        enabled: reminderEnabled,
        type: reminderType,
        customTime: reminderType === 'custom' && customReminderTime ? new Date(customReminderTime) : undefined
      }
    });

    if (res.success) {
      triggerToast('Task created successfully');
      setTitle('');
      setDescription('');
      setReminderEnabled(false);
      setShowAddForm(false);
    } else {
      triggerToast(res.message || 'Error creating task');
    }
  };

  // Handle Edit Task Save
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    const res = await updateTask(editingTask._id, {
      title: editingTask.title.trim(),
      description: editingTask.description,
      dueDate: editingTask.dueDate.split('T')[0],
      dueTime: editingTask.dueTime,
      priority: editingTask.priority,
      category: editingTask.category,
      reminder: editingTask.reminder
    });

    if (res.success) {
      triggerToast('Task updated successfully');
      setEditingTask(null);
    } else {
      triggerToast(res.message || 'Error updating task');
    }
  };

  const handleToggle = async (id, isDone) => {
    const res = await toggleTask(id);
    if (res.success && !isDone && !settings.reduceMotion) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#67e8f9', '#fbcfe8', '#ddd6fe', '#fef08a']
      });
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      const res = await deleteTask(id);
      if (res.success) {
        triggerToast('Task deleted from database');
      }
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && t.priority !== selectedPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchCat = (t.category || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchCat;
    }
    return true;
  });

  return (
    <div className="view-container">
      {/* Header Row */}
      <div className="view-header-row">
        <div>
          <h1 className="view-title">My Tasks</h1>
          <p className="view-subtitle">Manage, schedule, and complete your MongoDB tasks</p>
        </div>

        <div className="task-header-actions">
          <button
            type="button"
            className="primary-glass-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: activeSwatch.primary,
              boxShadow: `0 4px 14px ${activeSwatch.glow}`
            }}
          >
            <Plus size={16} />
            <span>{showAddForm ? 'Close Form' : 'New Task'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card tasks-filter-bar">
        <div className="filter-search-field">
          <Search size={15} className="filter-search-icon" />
          <input
            type="text"
            placeholder="Search tasks by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-bare"
          />
        </div>

        <div className="filter-controls-group">
          {/* Status filter pills */}
          <div className="task-filter-pills">
            <button
              type="button"
              className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({tasks.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({tasks.filter((t) => !t.completed).length})
            </button>
            <button
              type="button"
              className={`filter-pill ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({tasks.filter((t) => t.completed).length})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="glass-select"
          >
            {categories.map((c) => (
              <option key={c} value={c}>Category: {c}</option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="glass-select"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>Priority: {p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Creation Form (Collapsible / Modal) */}
      {showAddForm && (
        <div className="glass-card task-creation-panel">
          <div className="panel-header">
            <h3>Create New Task</h3>
            <button type="button" className="close-btn" onClick={() => setShowAddForm(false)}>
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="full-task-form">
            <div className="form-group">
              <label>Task Title *</label>
              <input
                type="text"
                placeholder="e.g. Internship Submission"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="glass-input"
              />
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                placeholder="Add task notes, checklist, or instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="glass-input textarea"
              />
            </div>

            <div className="form-row-grid">
              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="glass-input"
                />
              </div>

              <div className="form-group">
                <label>Due Time</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
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
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="glass-select full-width"
                >
                  <option value="Work">Work</option>
                  <option value="Design">Design</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Personal">Personal</option>
                  <option value="Research">Research</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            {/* Reminder Settings */}
            <div className="reminder-config-box">
              <div className="reminder-toggle-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                  />
                  <span>Set reminder notification for this task</span>
                </label>
              </div>

              {reminderEnabled && (
                <div className="reminder-options-row">
                  <div className="form-group">
                    <label>Remind me</label>
                    <select
                      value={reminderType}
                      onChange={(e) => setReminderType(e.target.value)}
                      className="glass-select"
                    >
                      <option value="5m">5 minutes before deadline</option>
                      <option value="15m">15 minutes before deadline</option>
                      <option value="30m">30 minutes before deadline</option>
                      <option value="1h">1 hour before deadline</option>
                      <option value="1d">1 day before deadline</option>
                      <option value="custom">Custom date & time</option>
                    </select>
                  </div>

                  {reminderType === 'custom' && (
                    <div className="form-group">
                      <label>Custom Date & Time</label>
                      <input
                        type="datetime-local"
                        value={customReminderTime}
                        onChange={(e) => setCustomReminderTime(e.target.value)}
                        className="glass-input"
                      />
                    </div>
                  )}
                </div>
              )}
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
                <Plus size={16} />
                <span>Save Task to MongoDB</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task List Container */}
      <div className="tasks-list-wrapper">
        {loading ? (
          <div className="loading-state glass-card">
            <Sparkles size={24} className="spin-icon" style={{ color: activeSwatch.primary }} />
            <p>Loading your tasks from MongoDB...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-tasks-state glass-card">
            <Sparkles size={36} style={{ color: activeSwatch.primary, margin: '0 auto 12px' }} />
            <h3>No tasks found</h3>
            <p>
              {searchQuery || selectedCategory !== 'All' || selectedPriority !== 'All'
                ? 'No tasks match your selected filter criteria.'
                : 'You have no tasks saved yet. Click "New Task" above to add your first goal.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const status = getDeadlineStatus(task);
            return (
              <div
                key={task._id}
                className={`task-item-card glass-card ${task.completed ? 'is-completed' : ''} ${
                  settings.showRowDividers ? 'has-divider' : ''
                }`}
                onClick={() => handleToggle(task._id, task.completed)}
              >
                <div className="task-card-left">
                  <button
                    type="button"
                    className={`task-checkbox-circle ${task.completed ? 'checked' : ''}`}
                    style={
                      task.completed
                        ? {
                            backgroundColor: activeSwatch.primary,
                            borderColor: activeSwatch.primary
                          }
                        : {}
                    }
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {task.completed && <Check size={13} color="#fff" strokeWidth={3} />}
                  </button>

                  <div className="task-text-group">
                    <span className="task-title-text">{task.title}</span>
                    {task.description && (
                      <p className="task-desc-text">{task.description}</p>
                    )}

                    <div className="task-meta-tags">
                      <span className="meta-category-tag">{task.category}</span>
                      <span className={`meta-priority-tag priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                      <span className={`meta-deadline-badge ${status.colorClass}`}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                        {task.dueTime ? ` · ${task.dueTime}` : ''}
                      </span>
                      <span className={`status-pill ${status.colorClass}`}>
                        {status.label}
                      </span>
                      {task.reminder?.enabled && (
                        <span className="meta-reminder-tag" title="Reminder Active">
                          <Bell size={11} />
                          <span>{task.reminder.type}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="task-actions-group" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="task-edit-btn"
                    onClick={() => {
                      setEditingTask({
                        ...task,
                        dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
                      });
                    }}
                    title="Edit task"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    type="button"
                    className="task-delete-btn"
                    onClick={(e) => handleDelete(task._id, e)}
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-backdrop" onClick={() => setEditingTask(null)}>
          <div className="glass-card modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <h3>Edit Task</h3>
              <button type="button" className="close-btn" onClick={() => setEditingTask(null)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="full-task-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  required
                  className="glass-input"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  rows={2}
                  className="glass-input textarea"
                />
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    required
                    className="glass-input"
                  />
                </div>

                <div className="form-group">
                  <label>Due Time</label>
                  <input
                    type="time"
                    value={editingTask.dueTime || '18:00'}
                    onChange={(e) => setEditingTask({ ...editingTask, dueTime: e.target.value })}
                    className="glass-input"
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
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
                    value={editingTask.category}
                    onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                    className="glass-select full-width"
                  >
                    <option value="Work">Work</option>
                    <option value="Design">Design</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Personal">Personal</option>
                    <option value="Research">Research</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              {/* Edit Reminder */}
              <div className="reminder-config-box">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingTask.reminder?.enabled || false}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        reminder: { ...editingTask.reminder, enabled: e.target.checked }
                      })
                    }
                  />
                  <span>Enable Reminder Notification</span>
                </label>

                {editingTask.reminder?.enabled && (
                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label>Reminder Lead Time</label>
                    <select
                      value={editingTask.reminder?.type || '15m'}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          reminder: { ...editingTask.reminder, type: e.target.value }
                        })
                      }
                      className="glass-select"
                    >
                      <option value="5m">5 minutes before deadline</option>
                      <option value="15m">15 minutes before deadline</option>
                      <option value="30m">30 minutes before deadline</option>
                      <option value="1h">1 hour before deadline</option>
                      <option value="1d">1 day before deadline</option>
                    </select>
                  </div>
                )}
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
                  <Check size={16} />
                  <span>Update Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
