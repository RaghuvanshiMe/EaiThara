const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTasks)
  .post(protect, admin, createTask);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, admin, deleteTask);

router.route('/project/:projectId')
  .get(protect, getTasksByProject);

module.exports = router;
