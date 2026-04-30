const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    let tasksQuery = {};
    let projectsQuery = {};

    if (req.user.role !== 'Admin') {
      tasksQuery.assignedTo = req.user._id;
      projectsQuery.members = req.user._id;
    }

    const totalTasks = await Task.countDocuments(tasksQuery);
    const totalProjects = await Project.countDocuments(projectsQuery);
    
    const tasksByStatus = await Task.aggregate([
      { $match: tasksQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const formattedTasksByStatus = {
      'To Do': 0,
      'In Progress': 0,
      'Done': 0
    };

    tasksByStatus.forEach(status => {
      formattedTasksByStatus[status._id] = status.count;
    });

    const currentDate = new Date();
    const overdueTasksQuery = { ...tasksQuery, dueDate: { $lt: currentDate }, status: { $ne: 'Done' } };
    const overdueTasksCount = await Task.countDocuments(overdueTasksQuery);
    const overdueTasks = await Task.find(overdueTasksQuery).populate('project', 'name').limit(5);

    res.status(200).json({
      totalTasks,
      totalProjects,
      tasksByStatus: formattedTasksByStatus,
      overdueTasksCount,
      overdueTasks
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
