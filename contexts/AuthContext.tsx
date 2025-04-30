import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, onAuthStateChange, getCurrentUser } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userRole: string | null;
  isAdmin: boolean;
  checkUserRole: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  userRole: null,
  isAdmin: false,
  checkUserRole: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Verifica e atualiza a role do usuário atual
  const checkUserRole = async (): Promise<string | null> => {
    if (!user) return null;
    
    // Se já temos a role no objeto do usuário, retornamos ela
    if (user.role) {
      setUserRole(user.role);
      return user.role;
    }
    
    // Caso contrário, obtemos o usuário atualizado com a role
    try {
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.role) {
        setUserRole(currentUser.role);
        setUser(currentUser);
        return currentUser.role;
      }
    } catch (error) {
      console.error('Erro ao verificar a role do usuário:', error);
    }
    
    return null;
  };

  useEffect(() => {
    // Inicializa verificando se há um usuário logado
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setUserRole(currentUser.role || null);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Inscreve-se para mudanças no estado de autenticação
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser);
      setUserRole(authUser?.role || null);
      setIsLoading(false);
    });

    // Limpa a inscrição
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    userRole,
    isAdmin: userRole === 'admin',
    checkUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
