import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">TaskFlow</div>
      
      <div style={{ marginBottom: '2rem', padding: '0 1rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Welcome back,</p>
        <p style={{ fontWeight: '600' }}>{user?.name}</p>
        <span className="badge" style={{ marginTop: '0.5rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
          {user?.role}
        </span>
      </div>

      <nav style={{ flex: 1 }}>
        <NavLink to="/" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} end>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/projects" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
          <FolderKanban size={20} />
          Projects
        </NavLink>
        {user?.role === 'Member' && (
          <NavLink to="/my-tasks" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            <CheckSquare size={20} />
            My Tasks
          </NavLink>
        )}
      </nav>

      <button 
        onClick={handleLogout}
        className="nav-link" 
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', marginTop: 'auto' }}
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
