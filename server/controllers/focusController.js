import FocusSession from '../models/FocusSession.js';

// @desc    Record completed focus session
// @route   POST /api/focus-sessions
export const createFocusSession = async (req, res) => {
  try {
    const { durationMinutes, mode, notes } = req.body;

    const session = await FocusSession.create({
      userId: req.user._id,
      durationMinutes: durationMinutes || 25,
      mode: mode || 'focus',
      notes: notes || '',
      completed: true,
      completedAt: new Date()
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get focus session stats for dashboard
// @route   GET /api/focus-sessions/stats
export const getFocusStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Today's completed focus sessions
    const todaySessions = await FocusSession.find({
      userId: req.user._id,
      completedAt: { $gte: startOfToday }
    });

    const todayMinutes = todaySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const todayCount = todaySessions.length;

    // Past 7 days breakdown
    const sevenDaysAgo = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
    const recentSessions = await FocusSession.find({
      userId: req.user._id,
      completedAt: { $gte: sevenDaysAgo }
    }).sort({ completedAt: -1 });

    const totalLifetimeSessions = await FocusSession.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: {
        todayMinutes,
        todayCount,
        totalLifetimeSessions,
        recentSessions: recentSessions.slice(0, 10)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get focus session history
// @route   GET /api/focus-sessions/history
export const getFocusHistory = async (req, res) => {
  try {
    const sessions = await FocusSession.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(30);

    res.json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
