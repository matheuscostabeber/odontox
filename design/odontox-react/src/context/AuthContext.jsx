// Autenticação fictícia para o ambiente de demonstração.
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'odontox_auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const login = () => {
    const u = { nome: 'Recepção' };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); } catch {}
    setUser(u);
  };
  const logout = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
