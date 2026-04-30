import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks');
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating task status');
    }
  };

  if (loading) return <div>Loading tasks...</div>;

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
      <h1 style={{ marginBottom: '2rem' }}>My Assigned Tasks</h1>
      
      {tasks.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>You have no assigned tasks. Enjoy your day!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3">
          {['To Do', 'In Progress', 'Done'].map(status => (
            <div key={status} className="glass-card" style={{ padding: '1rem' }}>
              <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>{status}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '200px' }}>
                {tasks.filter(t => t.status === status).map(task => (
                  <div key={task._id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', borderLeft: `3px solid ${getPriorityColor(task.priority)}` }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{task.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{task.description}</p>
                    
                    <div style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
                      <Link to={`/projects/${task.project?._id}`} style={{ color: 'var(--primary)' }}>
                        Project: {task.project?.name}
                      </Link>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      <span style={{ color: new Date(task.dueDate) < new Date() && status !== 'Done' ? 'var(--danger)' : 'inherit' }}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>

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
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
