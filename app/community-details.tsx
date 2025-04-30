import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Image,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { CustomAlert } from "@/components/ui/CustomAlert";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Community } from "@/data/communities";
import { getCommunityById } from "@/services/communityService";
import { useAuth } from "@/contexts/AuthContext";

export default function CommunityDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Extrair o nome da plataforma do link
  const getPlatformName = (url: string) => {
    if (!url) return 'Link';
    if (url.includes('t.me') || url.includes('telegram')) return 'Telegram';
    if (url.includes('whatsapp')) return 'WhatsApp';
    if (url.includes('facebook')) return 'Facebook';
    if (url.includes('instagram')) return 'Instagram';
    if (url.includes('discord')) return 'Discord';
    if (url.includes('meetup')) return 'Meetup';
    return 'Link';
  };

  const getPlatformIcon = (platformName: string) => {
    switch (platformName) {
      case 'Telegram': return 'paper-plane';
      case 'WhatsApp': return 'logo-whatsapp';
      case 'Facebook': return 'logo-facebook';
      case 'Instagram': return 'logo-instagram';
      case 'Discord': return 'logo-discord';
      case 'Meetup': return 'people';
      default: return 'link';
    }
  };

  // Fetch community data
  useEffect(() => {
    const communityId = params.id;
    if (communityId && typeof communityId === 'string') {
      setIsLoading(true);
      
      getCommunityById(communityId)
        .then(communityData => {
          if (communityData) {
            setCommunity(communityData);
          } else {
            CustomAlert.alert(
              "Erro",
              "Comunidade não encontrada.",
              [{ 
                text: "OK", 
                onPress: () => router.back()
              }]
            );
          }
        })
        .catch(error => {
          console.error("Error fetching community data:", error);
          CustomAlert.alert(
            "Erro",
            "Não foi possível carregar os dados da comunidade.",
            [{ 
              text: "OK", 
              onPress: () => router.back()
            }]
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      CustomAlert.alert(
        "Erro",
        "ID da comunidade não fornecido.",
        [{ 
          text: "OK", 
          onPress: () => router.back()
        }]
      );
    }
  }, [params.id]);

  // Update header title
  useEffect(() => {
    navigation.setOptions({
      title: community?.name || "Detalhes da Comunidade",
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ padding: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      ),
    });
  }, [community, navigation, router, colorScheme]);

  const handleEditCommunity = () => {
    if (community) {
      router.push({
        pathname: '/register-community' as any,
        params: { id: community.id }
      });
    }
  };

  const handleLinkPress = () => {
    if (community?.link) {
      Linking.openURL(community.link).catch(err => {
        console.error('Error opening link:', err);
        CustomAlert.alert(
          "Erro",
          "Não foi possível abrir o link. Verifique se você tem um aplicativo compatível instalado.",
          [{ text: "OK" }]
        );
      });
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primaryBlue} />
      </ThemedView>
    );
  }

  if (!community) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Comunidade não encontrada</ThemedText>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Voltar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const platformName = getPlatformName(community.link);
  const platformIcon = getPlatformIcon(platformName);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: community.imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        
        <View style={styles.content}>
          <ThemedText type="title" style={styles.name}>{community.name}</ThemedText>
          
          {community.categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              {community.categories.map((category, index) => (
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
          )}
          
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Descrição</ThemedText>
            <ThemedText style={styles.description}>{community.description}</ThemedText>
          </View>
          
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Link</ThemedText>
            <TouchableOpacity onPress={handleLinkPress}>
              <View style={styles.linkContainer}>
                <Ionicons 
                  name={platformIcon} 
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
                  {platformName} - Abrir
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>
          
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={[
                styles.editButton,
                { backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue }
              ]}
              onPress={handleEditCommunity}
            >
              <ThemedText style={styles.editButtonText}>Editar Comunidade</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
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
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#456EFD',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontFamily: 'Onest-SemiBold',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    marginBottom: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Onest-Medium',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.light.primaryBlue + '10',
    borderRadius: 8,
  },
  linkIcon: {
    marginRight: 10,
  },
  linkText: {
    fontSize: 16,
    fontFamily: 'Onest-Medium',
  },
  editButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Onest-SemiBold',
  },
});
