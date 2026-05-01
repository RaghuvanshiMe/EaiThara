import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// ✅ Set base URL once (IMPORTANT)
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${parsedUser.token}`;
    }

    setLoading(false);

    // ✅ Handle 401 globally
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          setUser(null);
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });

      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));

      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${res.data.token}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  // ✅ REGISTER
  const register = async (name, email, password, role) => {
    try {
      const res = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        role,
      });

      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));

      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${res.data.token}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || 'Registration failed',
      };
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
