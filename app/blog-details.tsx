import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Linking, 
  Alert 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getBlogById } from '@/services/blogService';
import { Blog } from '@/data/blogs';
import { useAuth } from '@/contexts/AuthContext';

export default function BlogDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const { isAdmin } = useAuth();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const blogId = params.id;
    if (blogId && typeof blogId === 'string') {
      fetchBlogDetails(blogId);
    } else {
      setError('ID do blog não encontrado');
      setIsLoading(false);
    }
  }, [params.id]);

  const fetchBlogDetails = async (id: string) => {
    try {
      setIsLoading(true);
      const blogData = await getBlogById(id);
      
      if (blogData) {
        setBlog(blogData);
      } else {
        setError('Blog não encontrado');
      }
    } catch (error) {
      console.error('Error fetching blog details:', error);
      setError('Erro ao carregar detalhes do blog');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenLink = async () => {
    if (!blog?.link) return;
    
    try {
      const supported = await Linking.canOpenURL(blog.link);
      
      if (supported) {
        await Linking.openURL(blog.link);
      } else {
        Alert.alert('Erro', `Não foi possível abrir o link: ${blog.link}`);
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar abrir o link');
    }
  };

  const handleEditBlog = () => {
    if (!blog) return;
    
    router.push({
      pathname: '/register-blog' as any,
      params: { id: blog.id }
    });
  };

  // Extrair o domínio do link
  const extractDomain = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch (error) {
      return url;
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primaryBlue} />
      </ThemedView>
    );
  }

  if (error || !blog) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={Colors.light.error} />
        <ThemedText style={styles.errorText}>{error || 'Blog não encontrado'}</ThemedText>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Voltar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const domain = blog.link ? extractDomain(blog.link) : '';

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Blog Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: blog.imageUrl }} 
            style={styles.image} 
            resizeMode="cover" 
          />
        </View>
        
        {/* Blog Content */}
        <View style={styles.contentContainer}>
          {/* Blog Name */}
          <ThemedText style={styles.name}>{blog.name}</ThemedText>
          
          {/* Categories */}
          {blog.categories && blog.categories.length > 0 && (
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>Categorias</ThemedText>
              <View style={styles.categoriesContainer}>
                {blog.categories.map((category, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.categoryBadge, 
                      { backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue + '20' }
                    ]}
                  >
                    <ThemedText 
                      style={[
                        styles.categoryText, 
                        { color: Colors[colorScheme ?? 'light'].primaryBlue }
                      ]}
                    >
                      {category}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Link */}
          {blog.link && (
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>Link</ThemedText>
              <TouchableOpacity 
                style={styles.linkContainer} 
                onPress={handleOpenLink}
              >
                <Ionicons 
                  name="globe-outline" 
                  size={20} 
                  color={Colors[colorScheme ?? 'light'].primaryBlue} 
                  style={styles.linkIcon}
                />
                <ThemedText 
                  style={[
                    styles.linkText, 
                    { color: Colors[colorScheme ?? 'light'].primaryBlue }
                  ]}
                >
                  {domain} - Visitar site
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Edit Button (only for admin) */}
      {isAdmin && (
        <View style={styles.editButtonContainer}>
          <TouchableOpacity
            style={[
              styles.editButton,
              { backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue }
            ]}
            onPress={handleEditBlog}
          >
            <Ionicons name="pencil" size={20} color="white" />
            <ThemedText style={styles.editButtonText}>Editar</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  backButtonText: {
    fontFamily: 'Onest-Medium',
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    width: '100%',
    height: 250,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Onest-Bold',
    marginBottom: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Onest-SemiBold',
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Onest-Medium',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.light.primaryBlue + '10',
    borderRadius: 8,
  },
  linkIcon: {
    marginRight: 8,
  },
  linkText: {
    fontSize: 16,
    fontFamily: 'Onest-Medium',
  },
  editButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontFamily: 'Onest-Medium',
  },
});
