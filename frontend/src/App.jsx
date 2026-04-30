import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import MyTasks from './pages/MyTasks';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes Wrapper */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <Dashboard />
                </main>
              </div>
            } />
            <Route path="/projects" element={
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <Projects />
                </main>
              </div>
            } />
            <Route path="/projects/:id" element={
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <ProjectDetails />
                </main>
              </div>
            } />
            <Route path="/my-tasks" element={
              <div className="app-container">
                <Sidebar />
                <main className="main-content">
                  <MyTasks />
                </main>
              </div>
            } />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
