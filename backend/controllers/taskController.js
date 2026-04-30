const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === 'Admin') {
      tasks = await Task.find().populate('project', 'name').populate('assignedTo', 'name email').sort({ dueDate: 1 });
    } else {
      // Member only sees tasks assigned to them
      tasks = await Task.find({ assignedTo: req.user._id }).populate('project', 'name').populate('assignedTo', 'name email').sort({ dueDate: 1 });
    }

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks for a specific project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Ensure Member is part of the project
    if (req.user.role !== 'Admin' && !project.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to view tasks for this project' });
    }

    const tasks = await Task.find({ project: req.params.projectId }).populate('assignedTo', 'name email').populate('project', 'name');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, project, assignedTo } = req.body;

    const proj = await Project.findById(project);
    if (!proj) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      project,
      assignedTo,
      creator: req.user._id
    });

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email').populate('project', 'name');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Members can only update status of tasks assigned to them
    if (req.user.role !== 'Admin') {
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      
      // If member, only allow status update
      const { status } = req.body;
      task.status = status || task.status;
      await task.save();
    } else {
      // Admin can update anything
      task = await Task.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
    }

    task = await Task.findById(req.params.id).populate('assignedTo', 'name email').populate('project', 'name');
    res.status(200).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.status(200).json({ id: req.params.id, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask
};
