import { StyleSheet, FlatList, Alert, Image, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ProfessionalCard } from '@/components/ProfessionalCard';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { Professional } from '@/data/professionals';
import { getAllProfessionals } from '@/services/professionalService';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ProfessionalsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProfessionals();
      setProfessionals(data);
    } catch (err) {
      console.error('Error fetching professionals:', err);
      setError('Não foi possível carregar os profissionais. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalPress = (id: string, name: string) => {
    Alert.alert(`Profissional selecionado`, `Você selecionou ${name}`);
    // Aqui você pode navegar para a tela de detalhes do profissional
  };

  const handleAddProfessional = () => {
    router.push('/register-professional');
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
            Carregando profissionais...
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
            onPress={fetchProfessionals}
          >
            <ThemedText style={styles.retryButtonText}>
              Tentar novamente
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (professionals.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.emptyText}>
            Nenhum profissional cadastrado ainda.
          </ThemedText>
        </View>
      );
    }

    return (
      <FlatList
        data={professionals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProfessionalCard
            name={item.name}
            address={item.address}
            imageUrl={item.imageUrl}
            specialty={item.specialty}
            onPress={() => handleProfessionalPress(item.id, item.name)}
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
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/professionals.jpg')}
            style={styles.headerImage}
          />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Profissionais</ThemedText>
        </ThemedView>
        
        <ThemedText style={styles.subtitle}>
          Encontre os melhores profissionais para cuidar da sua família
        </ThemedText>
        
        {renderContent()}
      </ParallaxScrollView>
      
      <FloatingActionButton onPress={handleAddProfessional} />
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
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
});
