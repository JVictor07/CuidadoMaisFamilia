import { StyleSheet, FlatList, Image, View, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CommunityCard } from '@/components/CommunityCard';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { Community } from '@/data/communities';
import { getCommunities } from '@/services/communityService';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { CustomAlert } from '@/components/ui/CustomAlert'; // Import CustomAlert

export default function CommunitiesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const refreshParam = params.refresh;
  const colorScheme = useColorScheme();
  const { user, isAdmin } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunities();
  }, [refreshParam]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      // Buscar dados do Firestore
      const firestoreCommunities = await getCommunities();
      setCommunities(firestoreCommunities);
    } catch (error) {
      console.error('Error fetching communities:', error);
      setError('Não foi possível carregar as comunidades. Tente novamente.');
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCommunityPress = (community: Community) => {
    if (user?.role === 'admin') {
      // Se for admin, vai para a tela de edição
      router.push({
        pathname: '/register-community' as any,
        params: { id: community.id }
      });
    } else {
      // Se for usuário comum, abre o link diretamente
      if (community.link) {
        Linking.openURL(community.link).catch(err => {
          console.error('Error opening link:', err);
          CustomAlert.alert(
            "Erro",
            "Não foi possível abrir o link. Verifique sua conexão com a internet.",
            [{ text: "OK" }]
          );
        });
      }
    }
  };

  const handleAddCommunity = () => {
    router.push('/register-community' as any);
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
            Carregando comunidades...
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
            onPress={fetchCommunities}
          >
            <ThemedText style={styles.retryButtonText}>
              Tentar novamente
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (communities.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.emptyText}>
            Nenhuma comunidade cadastrada ainda.
          </ThemedText>
          {isAdmin && (
            <TouchableOpacity
              style={[
                styles.addFirstButton,
                { backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue }
              ]}
              onPress={handleAddCommunity}
            >
              <ThemedText style={styles.addFirstButtonText}>
                Adicionar primeira comunidade
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        {communities.map((item) => (
          <CommunityCard
            key={item.id}
            name={item.name}
            description={item.description}
            imageUrl={item.imageUrl}
            link={item.link}
            categories={item.categories}
            onPress={() => handleCommunityPress(item)}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
          <View style={styles.headerImageContainer}>
            <Image
              source={require('@/assets/images/communities.jpg')}
              style={styles.headerImage}
            />
          </View>
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Comunidades</ThemedText>
        </ThemedView>

        <ThemedText style={styles.subtitle}>
          Encontre e participe de comunidades de apoio para sua família
        </ThemedText>

        {renderContent()}
      </ParallaxScrollView>

      {/* Mostrar o botão de adicionar apenas para admins */}
      {isAdmin && communities.length > 0 && <FloatingActionButton
        onPress={handleAddCommunity}
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
  headerImage: {
    height: 250,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    opacity: 0.85,
    resizeMode: 'cover',
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
