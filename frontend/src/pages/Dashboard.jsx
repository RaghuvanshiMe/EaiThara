import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Clock, AlertTriangle, Briefcase } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (!stats) return <div>Failed to load stats.</div>;

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      <div className="grid grid-cols-3" style={{ marginBottom: '3rem' }}>
        <div className="glass-card stat-card">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{stats.totalTasks}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Tasks</p>
          </div>
        </div>
        
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{stats.tasksByStatus['In Progress'] || 0}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>In Progress</p>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{stats.overdueTasksCount}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Overdue Tasks</p>
          </div>
        </div>
        
        {user.role === 'Admin' && (
          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--secondary)' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.8rem' }}>{stats.totalProjects}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Projects</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Overdue Tasks</h3>
          {stats.overdueTasks.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No overdue tasks. Great job!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats.overdueTasks.map(task => (
                <div key={task._id} style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', borderLeft: '4px solid var(--danger)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{task.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>Project: {task.project?.name}</span>
                    <span style={{ color: 'var(--danger)' }}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Task Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-todo">To Do</span>
              <span style={{ fontWeight: '600' }}>{stats.tasksByStatus['To Do'] || 0}</span>
            </div>
            <div style={{ height: '1px', background: 'var(--glass-border)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-progress">In Progress</span>
              <span style={{ fontWeight: '600' }}>{stats.tasksByStatus['In Progress'] || 0}</span>
            </div>
            <div style={{ height: '1px', background: 'var(--glass-border)' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge badge-done">Done</span>
              <span style={{ fontWeight: '600' }}>{stats.tasksByStatus['Done'] || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
