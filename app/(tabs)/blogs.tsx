import { StyleSheet, FlatList, Alert, Image, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BlogCard } from '@/components/BlogCard';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { Blog } from '@/data/blogs';
import { getBlogs } from '@/services/blogService';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { CustomAlert } from '@/components/ui/CustomAlert';

export default function BlogsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user, isAdmin } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      // Buscar dados do Firestore
      const firestoreBlogs = await getBlogs();
      setBlogs(firestoreBlogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Não foi possível carregar os blogs. Tente novamente.');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogPress = (blog: Blog) => {
    if (user?.role === 'admin') {
      // Se for admin, vai para a tela de edição
      router.push({
        pathname: '/register-blog' as any,
        params: { id: blog.id }
      });
    } else {
      // Se for usuário comum, vai para a tela de detalhes
      router.push({
        pathname: '/blog-details' as any,
        params: { id: blog.id }
      });
    }
  };

  const handleAddBlog = () => {
    router.push('/register-blog' as any);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator 
            size="large" 
            color={Colors[colorScheme ?? 'light'].primaryBlue} 
          />
          <ThemedText style={styles.loadingText}>
            Carregando blogs...
          </ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={[
              styles.retryButton, 
              { backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue }
            ]} 
            onPress={fetchBlogs}
          >
            <ThemedText style={styles.retryButtonText}>
              Tentar novamente
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (blogs.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.emptyText}>
            Nenhum blog cadastrado ainda.
          </ThemedText>
          {isAdmin && (
            <TouchableOpacity 
              style={[
                styles.addFirstButton, 
                { backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue }
              ]} 
              onPress={handleAddBlog}
            >
              <ThemedText style={styles.addFirstButtonText}>
                Adicionar primeiro blog
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <FlatList
        data={blogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BlogCard
            name={item.name}
            imageUrl={item.imageUrl}
            link={item.link}
            categories={item.categories}
            onPress={() => handleBlogPress(item)}
          />
        )}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
          <View style={styles.headerImageContainer}>
            <Ionicons 
              name="book" 
              size={120} 
              color={Colors[colorScheme ?? 'light'].text + '40'} 
              style={styles.headerIcon}
            />
          </View>
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Blogs</ThemedText>
        </ThemedView>
        
        <ThemedText style={styles.subtitle}>
          Encontre blogs com conteúdo relevante para sua família
        </ThemedText>
        
        {renderContent()}
      </ParallaxScrollView>
      
      {/* Mostrar o botão de adicionar apenas para admins */}
      {isAdmin && blogs.length > 0 && <FloatingActionButton 
        onPress={handleAddBlog} 
        color={Colors[colorScheme ?? 'light'].primaryBlue}
      />}
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    fontFamily: 'Onest-Medium',
  },
  headerImageContainer: {
    height: 250,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    opacity: 0.85,
  },
  subtitle: {
    marginBottom: 20,
    opacity: 0.8,
    fontFamily: 'Onest-Regular',
  },
  listContainer: {
    paddingBottom: 20,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FF3B30',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontFamily: 'Onest-Medium',
  },
  addFirstButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  addFirstButtonText: {
    color: 'white',
    fontFamily: 'Onest-SemiBold',
  },
});
