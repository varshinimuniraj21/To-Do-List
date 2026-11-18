import Task from '../models/Task.js';
import Notification from '../models/Notification.js';

// @desc    Create new task
// @route   POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      dueTime,
      priority,
      category,
      reminder
    } = req.body;

    if (!title || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Task title and due date are required'
      });
    }

    const task = new Task({
      userId: req.user._id,
      title,
      description: description || '',
      dueDate: new Date(dueDate),
      dueTime: dueTime || '18:00',
      priority: priority || 'Medium',
      category: category || 'General',
      reminder: reminder || { enabled: false }
    });

    await task.save();

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tasks for logged in user
// @route   GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const { category, priority, completed, search, sort } = req.query;
    const query = { userId: req.user._id };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    if (completed !== undefined && completed !== 'all') {
      query.completed = completed === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = { dueDate: 1, dueTime: 1 };
    if (sort === 'priority') {
      sortOptions = { priority: -1, dueDate: 1 };
    } else if (sort === 'createdAt') {
      sortOptions = { createdAt: -1 };
    }

    const tasks = await Task.find(query).sort(sortOptions);

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const fields = [
      'title',
      'description',
      'dueDate',
      'dueTime',
      'priority',
      'category',
      'completed',
      'reminder'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'dueDate') {
          task.dueDate = new Date(req.body.dueDate);
        } else {
          task[field] = req.body[field];
        }
      }
    });

    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle task completion
// @route   PATCH /api/tasks/:id/toggle
export const toggleTaskComplete = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.completed = !task.completed;
    await task.save();

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Clean up notifications linked to this task
    await Notification.deleteMany({ taskId: task._id });

    res.json({ success: true, message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get tasks by date range
// @route   GET /api/tasks/by-date
export const getTasksByDate = async (req, res) => {
  try {
    const { start, end, date } = req.query;
    const query = { userId: req.user._id };

    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      query.dueDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (start && end) {
      query.dueDate = { $gte: new Date(start), $lte: new Date(end) };
    }

    const tasks = await Task.find(query).sort({ dueDate: 1, dueTime: 1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get upcoming and overdue tasks
// @route   GET /api/tasks/upcoming
export const getUpcomingDeadlines = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysLater = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

    const overdue = await Task.find({
      userId: req.user._id,
      completed: false,
      dueDate: { $lt: startOfToday }
    }).sort({ dueDate: 1 });

    const upcoming = await Task.find({
      userId: req.user._id,
      completed: false,
      dueDate: { $gte: startOfToday, $lte: sevenDaysLater }
    }).sort({ dueDate: 1, dueTime: 1 });

    res.json({
      success: true,
      data: {
        overdue,
        upcoming
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
