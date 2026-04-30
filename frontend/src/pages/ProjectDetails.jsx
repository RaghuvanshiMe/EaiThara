import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus } from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Task State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');

  // Add Member State
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        axios.get(`/api/projects/${id}`),
        axios.get(`/api/tasks/project/${id}`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);

      if (user.role === 'Admin') {
        const usersRes = await axios.get('/api/auth/users');
        setUsers(usersRes.data);
      }
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        dueDate: taskDueDate,
        project: id,
        assignedTo: taskAssignedTo
      });
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('Medium');
      setTaskDueDate('');
      setTaskAssignedTo('');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/projects/${id}/members`, { userId: selectedUser });
      setShowMemberModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding member');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating task status');
    }
  };

  if (loading) return <div>Loading project details...</div>;
  if (!project) return <div>Project not found.</div>;

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'var(--danger)';
      case 'Medium': return 'var(--warning)';
      case 'Low': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>{project.name}</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>{project.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {user.role === 'Admin' && (
            <>
              <button className="btn btn-outline" onClick={() => setShowMemberModal(true)}>
                <Plus size={18} /> Add Member
              </button>
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                <Plus size={18} /> New Task
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3">
        {/* Kanban Board Columns */}
        {['To Do', 'In Progress', 'Done'].map(status => (
          <div key={status} className="glass-card" style={{ padding: '1rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{status}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '200px' }}>
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task._id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', borderLeft: `3px solid ${getPriorityColor(task.priority)}` }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{task.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>{task.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    <span>{task.assignedTo?.name}</span>
                  </div>

                  {/* Status update controls (Members can update their tasks, Admins can update any) */}
                  {(user.role === 'Admin' || task.assignedTo?._id === user._id) && (
                    <select 
                      className="form-control" 
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)' }}
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input type="text" className="form-control" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={taskDesc} onChange={e => setTaskDesc(e.target.value)} required rows="2"></textarea>
              </div>
              <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={taskPriority} onChange={e => setTaskPriority(e.target.value)} style={{ appearance: 'none', background: 'rgba(15, 23, 42, 0.6)' }}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input type="date" className="form-control" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-control" value={taskAssignedTo} onChange={e => setTaskAssignedTo(e.target.value)} required style={{ appearance: 'none', background: 'rgba(15, 23, 42, 0.6)' }}>
                  <option value="">Select a member...</option>
                  {project.members.map(member => (
                    <option key={member._id} value={member._id}>{member.name} ({member.email})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowTaskModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add Team Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">Select User</label>
                <select className="form-control" value={selectedUser} onChange={e => setSelectedUser(e.target.value)} required style={{ appearance: 'none', background: 'rgba(15, 23, 42, 0.6)' }}>
                  <option value="">Select a user...</option>
                  {users.filter(u => !project.members.some(pm => pm._id === u._id)).map(user => (
                    <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowMemberModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
