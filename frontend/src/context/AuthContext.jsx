import { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currUsername, setCurrUsername] = useState('');
  useEffect(() => {
    if(token){
      const decodedToken = jwtDecode(token);
      setCurrUsername(decodedToken.username);
    }
  }, [token]);

  const saveToken = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const removeToken = () => {
    localStorage.removeItem('token');
    setToken('');
  }

  const value = {
    token,
    saveToken,
    removeToken,
    currUsername
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
