import Task from '../models/Task.js';
import FocusSession from '../models/FocusSession.js';

// @desc    Get consolidated dynamic dashboard statistics calculated from MongoDB
// @route   GET /api/dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const sevenDaysLater = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 1. Total, Completed, and Pending tasks
    const totalTasks = await Task.countDocuments({ userId });
    const completedTasks = await Task.countDocuments({ userId, completed: true });
    const pendingTasks = await Task.countDocuments({ userId, completed: false });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 2. Today's tasks (due today)
    const todayTasks = await Task.find({
      userId,
      dueDate: { $gte: startOfToday, $lte: endOfToday }
    }).sort({ completed: 1, dueTime: 1 });

    // 3. Overdue tasks (due before today and not completed)
    const overdueTasks = await Task.find({
      userId,
      completed: false,
      dueDate: { $lt: startOfToday }
    }).sort({ dueDate: 1 });

    // 4. Upcoming deadlines (due within next 7 days, excluding today)
    const tomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const upcomingTasks = await Task.find({
      userId,
      completed: false,
      dueDate: { $gte: tomorrow, $lte: sevenDaysLater }
    }).sort({ dueDate: 1, dueTime: 1 });

    // 5. Upcoming reminders
    const upcomingReminders = await Task.find({
      userId,
      completed: false,
      'reminder.enabled': true,
      'reminder.remindAt': { $gte: now }
    }).sort({ 'reminder.remindAt': 1 }).limit(5);

    // 6. Today's focus time
    const todaySessions = await FocusSession.find({
      userId,
      completedAt: { $gte: startOfToday, $lte: endOfToday }
    });
    const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const todayFocusSessionsCount = todaySessions.length;

    // 7. Weekly productivity (completed tasks grouped by day for past 7 days)
    const sevenDaysAgo = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
    const completedPastWeek = await Task.find({
      userId,
      completed: true,
      completedAt: { $gte: sevenDaysAgo }
    });

    // Build 7-day velocity array
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyVelocity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const count = completedPastWeek.filter(
        (t) => t.completedAt && t.completedAt >= dayStart && t.completedAt <= dayEnd
      ).length;

      weeklyVelocity.push({
        day: dayNames[d.getDay()],
        date: d.toISOString().split('T')[0],
        completed: count
      });
    }

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate,
        overdueCount: overdueTasks.length,
        todayTasksCount: todayTasks.length,
        todayTasks,
        overdueTasks,
        upcomingTasks,
        upcomingReminders,
        todayFocusMinutes,
        todayFocusSessionsCount,
        weeklyVelocity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
