import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChange, signInUser, signOutUser, registerUser } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await signInUser(email, password);
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOutUser();
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await registerUser(email, password);
    } catch (err) {
      const errorMessage = getAuthErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (error: any): string => {
  const errorCode = error.code || '';
  
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'O endereço de e-mail não é válido.';
    case 'auth/user-disabled':
      return 'Esta conta de usuário foi desativada.';
    case 'auth/user-not-found':
      return 'Não há usuário com este e-mail.';
    case 'auth/wrong-password':
      return 'Senha incorreta.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está sendo usado por outra conta.';
    case 'auth/weak-password':
      return 'A senha é muito fraca. Use pelo menos 6 caracteres.';
    case 'auth/operation-not-allowed':
      return 'Operação não permitida.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas de login. Tente novamente mais tarde.';
    default:
      return error.message || 'Ocorreu um erro durante a autenticação.';
  }
};
