const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const mongoose = require('mongoose');
const auth = require('../middleware/authMiddleware');

// Helper function to calculate next due date
const calculateNextDueDate = (currentDueDate, recurrenceType, interval = 1) => {
  if (!currentDueDate) return null;
  
  const date = new Date(currentDueDate);
  
  switch (recurrenceType) {
    case 'daily':
      date.setDate(date.getDate() + interval);
      break;
    case 'weekly':
      date.setDate(date.getDate() + (7 * interval));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + interval);
      break;
    case 'custom':
      date.setDate(date.getDate() + interval);
      break;
    default:
      return null;
  }
  
  return date;
};

// ✅ Create task
router.post(
  '/',
  auth,
  [
    body('title')
      .notEmpty()
      .withMessage('Title is required and cannot be empty'),
    body('dueDate')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('Due date must be a valid date'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High'])
      .withMessage('Priority must be Low, Medium, or High'),
    body('category')
      .optional()
      .isString()
      .withMessage('Category must be a string'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    body('isCompleted')
      .optional()
      .isBoolean()
      .withMessage('isCompleted must be a boolean'),
    body('subtasks')
      .optional()
      .isArray()
      .withMessage('Subtasks must be an array'),
    body('subtasks.*.title')
      .optional()
      .isString()
      .withMessage('Each subtask must have a title'),
    body('subtasks.*.completed')
      .optional()
      .isBoolean()
      .withMessage('Each subtask completed must be a boolean'),
    body('recurrenceType')
      .optional()
      .isIn(['none', 'daily', 'weekly', 'monthly', 'custom'])
      .withMessage('Recurrence type must be none, daily, weekly, monthly, or custom'),
    body('recurrenceInterval')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Recurrence interval must be a positive integer'),
    body('reminderMinutesBefore')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Reminder minutes before must be a non-negative integer'),
    body('assignedTo')
      .optional()
      .isMongoId()
      .withMessage('AssignedTo must be a valid MongoDB ID'),
  ],
  async (req, res) => {
    console.log('Received task POST body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, dueDate, priority, category, description, isCompleted, subtasks, recurrenceType, recurrenceInterval, reminderMinutesBefore, assignedTo } = req.body;
      console.log('Creating task with data:', { title, dueDate, priority, category, description, isCompleted, subtasks, recurrenceType, recurrenceInterval, reminderMinutesBefore, assignedTo });
      
      const task = new Task({
        user: req.userId,
        assignedTo: assignedTo || req.userId,
        assignedBy: assignedTo && assignedTo !== req.userId ? req.userId : null,
        title,
        dueDate,
        priority,
        category,
        description,
        isCompleted,
        subtasks,
        recurrenceType,
        recurrenceInterval,
        reminderMinutesBefore,
      });
      console.log('Task object before save:', task);
      
      await task.save();
      console.log('Task saved successfully:', task);
      res.status(201).json(task);
    } catch (err) {
      console.error('Error creating task:', err);
      res.status(500).send('Server error');
    }
  }
);

// Bulk upload tasks (admin only)
router.post('/bulk-upload', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ msg: 'Only admins can bulk upload tasks.' });
    }
    const { tasks } = req.body;
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ msg: 'No tasks provided.' });
    }
    const created = [];
    const failed = [];
    for (const t of tasks) {
      try {
        // Required fields: title, assignedTo, dueDate
        if (!t.title || !t.assignedTo) {
          failed.push({ ...t, error: 'Missing title or assignedTo' });
          continue;
        }
        // Build task object
        const task = new Task({
          user: req.userId, // admin creating
          assignedTo: t.assignedTo,
          assignedBy: req.userId,
          title: t.title,
          description: t.description || '',
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          priority: t.priority || 'Medium',
          category: t.category || 'Work',
          isCompleted: false,
          userCompleted: false,
          adminCompleted: false,
          subtasks: t.subtasks || [],
          recurrenceType: t.recurrenceType || 'none',
          recurrenceInterval: t.recurrenceInterval || 1,
          reminderMinutesBefore: t.reminderMinutesBefore || null,
        });
        await task.save();
        created.push(task);
      } catch (err) {
        failed.push({ ...t, error: err.message });
      }
    }
    res.json({ createdCount: created.length, failedCount: failed.length, created, failed });
  } catch (err) {
    res.status(500).json({ msg: 'Bulk upload failed', error: err.message });
  }
});

// ✅ Get all tasks with filtering, sorting, and pagination
router.get('/', auth, async (req, res) => {
  try {
    let filter = {};
    if (req.userRole === 'admin') {
      // Admin: tasks assigned by or to this admin
      filter = { $or: [
        { user: req.userId },
        { assignedBy: req.userId },
        { assignedTo: req.userId }
      ] };
    } else {
      // User: tasks assigned to this user
      filter = { assignedTo: req.userId };
    }
    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// ✅ Update task by ID
router.put(
  '/:id',
  auth,
  [
    body('title')
      .optional()
      .notEmpty()
      .withMessage('If provided, title cannot be empty'),
    body('isCompleted')
      .optional()
      .isBoolean()
      .withMessage('If provided, isCompleted must be a boolean'),
    body('dueDate')
      .optional()
      .isISO8601()
      .toDate()
      .withMessage('If provided, dueDate must be a valid date'),
    body('priority')
      .optional()
      .isIn(['Low', 'Medium', 'High'])
      .withMessage('If provided, priority must be Low, Medium, or High'),
    body('category')
      .optional()
      .isString()
      .withMessage('If provided, category must be a string'),
    body('description')
      .optional()
      .isString()
      .withMessage('If provided, description must be a string'),
    body('subtasks')
      .optional()
      .isArray()
      .withMessage('Subtasks must be an array'),
    body('subtasks.*.title')
      .optional()
      .isString()
      .withMessage('Each subtask must have a title'),
    body('subtasks.*.completed')
      .optional()
      .isBoolean()
      .withMessage('Each subtask completed must be a boolean'),
    body('recurrenceType')
      .optional()
      .isIn(['none', 'daily', 'weekly', 'monthly', 'custom'])
      .withMessage('Recurrence type must be none, daily, weekly, monthly, or custom'),
    body('recurrenceInterval')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Recurrence interval must be a positive integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updates = req.body;
      let task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ msg: 'Task not found' });
      }

      // Permissions logic
      const isAdmin = req.userId.toString() === (task.user && task.user.toString());
      const isAssignee = req.userId.toString() === (task.assignedTo && task.assignedTo.toString());
      const isAdminAssigned = !!task.assignedBy;

      // Only admin or assignee can update
      if (!isAdmin && !isAssignee) {
        return res.status(403).json({ msg: 'Not authorized' });
      }

      // If admin-assigned and user is assignee
      if (isAdminAssigned && isAssignee && !isAdmin) {
        // User can only update subtasks and userCompleted
        const allowedFields = ['subtasks', 'userCompleted'];
        const invalidField = Object.keys(updates).find(
          k => !allowedFields.includes(k)
        );
        if (invalidField) {
          return res.status(403).json({ msg: 'You can only update subtasks or mark complete for this task' });
        }
      }

      // If admin-assigned and user is admin
      if (isAdminAssigned && isAdmin) {
        // Admin can update anything, including adminCompleted
      }

      // If not admin-assigned, allow full update for owner
      // Apply updates
      // Set completedAt when marking as completed
      if ('isCompleted' in updates) {
        if (updates.isCompleted) {
          updates.completedAt = new Date();
        } else {
          updates.completedAt = null;
        }
      }
      Object.assign(task, updates);
      await task.save();
      res.json(task);
    } catch (err) {
      res.status(500).send('Server error');
    }
  }
);

// ✅ Delete task by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    const isAdmin = req.userId.toString() === (task.user && task.user.toString());
    const isAssignee = req.userId.toString() === (task.assignedTo && task.assignedTo.toString());
    const isAdminAssigned = !!task.assignedBy;
    // Only admin or assignee can delete
    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    // If admin-assigned, only allow delete if both completed, UNLESS admin is deleting
    if (isAdminAssigned && (!task.userCompleted || !task.adminCompleted) && !isAdmin) {
      return res.status(403).json({ msg: 'Task can only be deleted after both user and admin have marked it complete' });
    }
    if (task.deletedAt) {
      return res.status(400).json({ msg: 'Task already in Trash' });
    }
    task.deletedAt = new Date();
    await task.save();
    res.json({ msg: 'Task moved to Trash' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// ✅ Restore a trashed task
router.patch('/:id/restore', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    if (!task.deletedAt) {
      return res.status(400).json({ msg: 'Task is not in Trash' });
    }
    task.deletedAt = null;
    await task.save();
    res.json({ msg: 'Task restored' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// ✅ Get tasks in Trash (deleted in last 48 hours)
router.get('/trash', auth, async (req, res) => {
  try {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago
    const trashedTasks = await Task.find({ user: req.userId, deletedAt: { $ne: null, $gte: cutoff } }).sort({ deletedAt: -1 });
    res.json(trashedTasks);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// ✅ Permanently delete a trashed task
router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }
    if (!task.deletedAt) {
      return res.status(400).json({ msg: 'Task is not in Trash' });
    }
    await Task.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Task permanently deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// ✅ Task stats by range (week, month, etc.)
router.get('/stats', auth, async (req, res) => {
  try {
    const range = req.query.range || 'all'; // default = all time

    const rangeMap = {
      week: 7,
      month: 30,
      '2month': 60,
      '3month': 90,
      '4month': 120,
      '5month': 150,
      '6month': 180,
      year: 365,
    };

    let dateFilter = {};
    if (range !== 'all' && rangeMap[range]) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - rangeMap[range]);
      dateFilter.createdAt = { $gte: daysAgo };
    }

    const matchFilter = {
      user: req.userId,
      ...(dateFilter.createdAt && { createdAt: dateFilter.createdAt }),
    };

    const totalTasks = await Task.countDocuments(matchFilter);
    const completedTasks = await Task.countDocuments({
      ...matchFilter,
      isCompleted: true,
    });
    const pendingTasks = totalTasks - completedTasks;

    res.json({
      range: range === 'all' ? 'All Time' : range,
      totalTasks,
      completedTasks,
      pendingTasks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.userId;

    const [byCategory, byPriority] = await Promise.all([
      Task.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    const categorySummary = {};
    byCategory.forEach(item => {
      categorySummary[item._id || 'Uncategorized'] = item.count;
    });

    const prioritySummary = {};
    byPriority.forEach(item => {
      prioritySummary[item._id || 'Unspecified'] = item.count;
    });

    res.json({
      byCategory: categorySummary,
      byPriority: prioritySummary
    });
  } catch (err) {
    console.error('Summary error:', err.message);
    res.status(500).json({ msg: 'Failed to get task summary' });
  }
});

// ✅ Get AI Insights (rule-based)
router.get('/insights', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId });
    const insights = [];

    // Productivity tips
    if (tasks.length > 0) {
      // Most productive day
      const completed = tasks.filter(t => t.isCompleted && t.completedAt);
      const dayCounts = Array(7).fill(0); // 0=Sun, 6=Sat
      completed.forEach(t => {
        const d = new Date(t.completedAt);
        dayCounts[d.getDay()]++;
      });
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const maxDayIdx = dayCounts.indexOf(Math.max(...dayCounts));
      if (dayCounts[maxDayIdx] > 0) {
        insights.push(`🎯 Most productive day: ${days[maxDayIdx]}`);
      }
    }

    // Task prioritization
    const overdueHigh = tasks.filter(t => !t.isCompleted && t.priority === 'High' && t.dueDate && new Date(t.dueDate) < new Date());
    if (overdueHigh.length > 0) {
      insights.push(`⚡ ${overdueHigh.length} high-priority task${overdueHigh.length > 1 ? 's are' : ' is'} overdue`);
    }

    // Motivational nudges
    let streak = 0;
    let maxStreak = 0;
    const sorted = completed.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
    let lastDate = null;
    sorted.forEach(t => {
      const d = new Date(t.completedAt).toDateString();
      if (lastDate === d) {
        streak++;
      } else {
        streak = 1;
        lastDate = d;
      }
      if (streak > maxStreak) maxStreak = streak;
    });
    if (maxStreak >= 5) {
      insights.push(`🏆 ${maxStreak} tasks completed in a row! Keep it up!`);
    }

    // Time management advice
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    const dueTomorrow = tasks.filter(t => t.dueDate && t.dueDate.slice(0, 10) === tomorrowStr && !t.isCompleted);
    if (dueTomorrow.length >= 4) {
      insights.push(`⏰ ${dueTomorrow.length} tasks due tomorrow. Consider rescheduling.`);
    }

    // Recurring pattern detection (simple: same title, same weekday)
    const titleWeekdayMap = {};
    tasks.forEach(t => {
      if (!t.dueDate) return;
      const d = new Date(t.dueDate);
      const key = t.title + '-' + d.getDay();
      titleWeekdayMap[key] = (titleWeekdayMap[key] || 0) + 1;
    });
    Object.entries(titleWeekdayMap).forEach(([key, count]) => {
      if (count >= 3) {
        const [title, dayIdx] = key.split('-');
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        insights.push(`🔁 Recurring pattern detected: You add '${title}' every ${days[dayIdx]}. Make it recurring?`);
      }
    });

    if (insights.length === 0) {
      insights.push('No insights yet. Add and complete more tasks to see personalized tips!');
    }

    res.json({ insights });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// TEMPORARY: Delete all tasks without assignedTo (use once, then remove for security)
router.delete('/delete-tasks-without-assignedTo', async (req, res) => {
  try {
    console.log('Route hit!');
    const result = await Task.deleteMany({});
    res.json({ msg: 'All tasks deleted', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Error deleting tasks:', err);
    res.status(500).json({ msg: 'Failed to delete tasks' });
  }
});

module.exports = router;
