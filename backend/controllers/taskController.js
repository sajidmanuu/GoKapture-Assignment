import Task from '../models/taskModel.js';
import User from '../models/userModel.js';

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, due_date, user_id } = req.body;

    // Check if the user is an admin, allow them to assign tasks to any user
    const assignedUserId = req.user.role === 'Admin' && user_id ? user_id : req.user.id;

    // Verify if the assigned user exists (if provided)
    if (user_id) {
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
    }

    const task = new Task({
      title,
      description,
      status,
      priority,
      due_date,
      user_id: assignedUserId,
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { status, priority, due_date, search } = req.query;

    // Build filter object
    const filter = req.user.role === 'Admin' ? {} : { user_id: req.user.id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (due_date) filter.due_date = new Date(due_date);
    if (search) {
      const regex = new RegExp(search, 'i'); // Case insensitive search
      filter.$or = [{ title: regex }, { description: regex }];
    }

    // Fetch tasks with filter
    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, user_id } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Admins can reassign tasks
    if (user_id && req.user.role === 'Admin') {
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'New assignee not found' });
      }
      task.user_id = user_id;
    } else if (task.user_id.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.updated_at = Date.now();

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check if the user is either the owner of the task or an admin
    if (task.user_id.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.deleteOne({ _id: req.params.taskId });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { createTask, getTasks, updateTask, deleteTask };
