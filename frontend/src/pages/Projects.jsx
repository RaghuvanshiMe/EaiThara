import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Users, Calendar } from 'lucide-react';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Project Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', { name, description, deadline });
      setShowModal(false);
      setName('');
      setDescription('');
      setDeadline('');
      fetchProjects();
    } catch (error) {
      console.error('Error creating project', error);
      alert(error.response?.data?.message || 'Error creating project');
    }
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Projects</h1>
        {user?.role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} /> Create Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-3">
        {projects.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No projects found.</p>
        ) : (
          projects.map(project => (
            <Link key={project._id} to={`/projects/${project._id}`} style={{ color: 'inherit' }}>
              <div className="glass-card" style={{ cursor: 'pointer', transition: 'var(--transition)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{project.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Users size={14} /> {project.members?.length || 0} Members
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} /> {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>Project Name</label>
                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '0.5rem 1rem' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>Description</label>
                <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} required rows="2" style={{ padding: '0.5rem 1rem' }}></textarea>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>Deadline</label>
                <input type="date" className="form-control" value={deadline} onChange={e => setDeadline(e.target.value)} required style={{ padding: '0.5rem 1rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.5rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.5rem' }}>Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
