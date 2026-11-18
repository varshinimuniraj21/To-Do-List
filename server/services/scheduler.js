import cron from 'node-cron';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';

export const startReminderScheduler = () => {
  console.log('[Scheduler] Background reminder engine initialized (running every 15s)');

  // Run every 15 seconds to reliably trigger reminders within seconds of their scheduled time
  cron.schedule('*/15 * * * * *', async () => {
    try {
      const now = new Date();

      // Find tasks whose remindAt time has passed and have not been notified yet, and are NOT completed
      const pendingReminders = await Task.find({
        'reminder.enabled': true,
        'reminder.notified': false,
        completed: false,
        'reminder.remindAt': { $lte: now }
      });

      for (const task of pendingReminders) {
        // Prevent duplicate notification for the same task reminder
        const existingNotif = await Notification.findOne({
          userId: task.userId,
          taskId: task._id,
          type: 'reminder'
        });

        if (!existingNotif) {
          const dateStr = new Date(task.dueDate).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
          });
          const timeStr = task.dueTime ? ` at ${task.dueTime}` : '';

          await Notification.create({
            userId: task.userId,
            taskId: task._id,
            title: `⏰ Reminder: ${task.title}`,
            message: `Priority: ${task.priority} · Due ${dateStr}${timeStr}. Time to focus!`,
            type: 'reminder',
            read: false
          });

          console.log(`[Scheduler] Reminder dispatched for task "${task.title}" (User: ${task.userId})`);
        }

        task.reminder.notified = true;
        await task.save();
      }

      // Check for overdue tasks (passed due date/time, not completed, not already warned)
      const overdueTasks = await Task.find({
        completed: false,
        dueDate: { $lt: new Date(now.getTime() - 60 * 1000) } // 1 minute buffer
      }).limit(10);

      for (const task of overdueTasks) {
        const existingOverdue = await Notification.findOne({
          userId: task.userId,
          taskId: task._id,
          type: 'deadline'
        });

        if (!existingOverdue) {
          await Notification.create({
            userId: task.userId,
            taskId: task._id,
            title: `⚠️ Task Overdue: ${task.title}`,
            message: `Was due on ${new Date(task.dueDate).toLocaleDateString()}. Tap to reschedule or complete.`,
            type: 'deadline',
            read: false
          });
        }
      }
    } catch (error) {
      console.error('[Scheduler Error]', error.message);
    }
  });
};
