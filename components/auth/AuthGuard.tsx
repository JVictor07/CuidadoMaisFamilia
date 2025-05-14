import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// List of public routes that don't require authentication
const publicRoutes = ['/login', '/forgot-password', '/signup'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = publicRoutes.some(route => pathname === route);
      
      if (!isAuthenticated && !isPublicRoute) {
        // Redirect to login if user is not authenticated and trying to access a protected route
        router.replace('/login');
      } else if (isAuthenticated && publicRoutes.some(route => pathname === route)) {
        // Redirect to home if user is authenticated and trying to access a public route (like login)
        router.replace('/(tabs)/professionals');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    // Show loading spinner while checking authentication status
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primaryBlue} />
      </View>
    );
  }

  // If not loading, render children (the actual app content)
  return <>{children}</>;
}
