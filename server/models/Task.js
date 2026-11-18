import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['5m', '15m', '30m', '1h', '1d', 'custom'],
      default: '15m'
    },
    customTime: {
      type: Date
    },
    remindAt: {
      type: Date
    },
    notified: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    dueTime: {
      type: String,
      default: '18:00', // HH:mm format
      trim: true
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    reminder: {
      type: reminderSchema,
      default: () => ({ enabled: false })
    }
  },
  { timestamps: true }
);

// Calculate exact remindAt timestamp before saving
taskSchema.pre('save', function () {
  if (this.isModified('dueDate') || this.isModified('dueTime') || this.isModified('reminder')) {
    if (this.reminder && this.reminder.enabled) {
      // Calculate target deadline Date
      const target = new Date(this.dueDate);
      if (this.dueTime) {
        const [hours, mins] = this.dueTime.split(':').map(Number);
        target.setHours(isNaN(hours) ? 18 : hours);
        target.setMinutes(isNaN(mins) ? 0 : mins);
        target.setSeconds(0);
        target.setMilliseconds(0);
      }

      if (this.reminder.type === 'custom' && this.reminder.customTime) {
        this.reminder.remindAt = new Date(this.reminder.customTime);
      } else {
        let diffMs = 15 * 60 * 1000; // default 15m
        if (this.reminder.type === '5m') diffMs = 5 * 60 * 1000;
        else if (this.reminder.type === '15m') diffMs = 15 * 60 * 1000;
        else if (this.reminder.type === '30m') diffMs = 30 * 60 * 1000;
        else if (this.reminder.type === '1h') diffMs = 60 * 60 * 1000;
        else if (this.reminder.type === '1d') diffMs = 24 * 60 * 60 * 1000;

        this.reminder.remindAt = new Date(target.getTime() - diffMs);
      }

      // If reminder was edited, reset notified if remindAt is in future
      if (this.isModified('reminder.type') || this.isModified('reminder.customTime')) {
        this.reminder.notified = false;
      }
    }
  }

  if (this.isModified('completed')) {
    this.completedAt = this.completed ? new Date() : null;
  }
});

taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ 'reminder.enabled': 1, 'reminder.notified': 1, 'reminder.remindAt': 1 });

export default mongoose.model('Task', taskSchema);
