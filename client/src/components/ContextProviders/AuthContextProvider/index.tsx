import { ReactNode, useState } from 'react';
import { AuthContext } from './context';
import { useNavigate } from 'react-router-dom';

export interface AuthContextProviderProps {
  children: ReactNode;
}

export default function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('username') || '');
  const navigate = useNavigate();

  const login = async (userCredentials: { username: string; password: string }) => {
    try {
      const response = await fetch('http://localhost:5274/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userCredentials)
      });
      const res = await response.json();
      if (res.data) {
        setUser({ username: res.data.username });
        setToken(res.data.username);
        localStorage.setItem('username', res.data.username);
        navigate('/dashboard');
        return;
      }
      throw new Error(res.error);
    } catch (err) {
      console.error(err);
    }
  };

  const logOut = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('username');
    navigate('/sign-in');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
