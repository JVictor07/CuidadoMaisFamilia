import React from 'react';
import { StyleSheet, Image, View, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

interface CommunityCardProps {
  name: string;
  description: string;
  imageUrl: string;
  link: string;
  categories: string[];
  onPress?: () => void;
}

export function CommunityCard({ 
  name, 
  description, 
  imageUrl, 
  link,
  categories,
  onPress 
}: CommunityCardProps) {
  const colorScheme = useColorScheme();
  const cardBgColor = { 
    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground 
  };
  const categoryBgColor = {
    backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue + '20' // Adding transparency
  };
  const categoryTextColor = {
    color: Colors[colorScheme ?? 'light'].primaryBlue
  };

  // Extrair o nome da plataforma do link
  const getPlatformName = (url: string) => {
    if (url.includes('t.me') || url.includes('telegram')) return 'Telegram';
    if (url.includes('whatsapp')) return 'WhatsApp';
    if (url.includes('facebook')) return 'Facebook';
    if (url.includes('instagram')) return 'Instagram';
    if (url.includes('discord')) return 'Discord';
    if (url.includes('meetup')) return 'Meetup';
    return 'Link';
  };

  const platformName = getPlatformName(link);
  const platformIcon = () => {
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

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <ThemedView style={[styles.card, cardBgColor]}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.contentContainer}>
          <ThemedText type="defaultSemiBold" style={styles.name}>{name}</ThemedText>
          
          {categories.length > 0 && (
            <View style={styles.categoriesRow}>
              {categories.map((category, index) => (
                <View 
                  key={index} 
                  style={[styles.categoryContainer, categoryBgColor]}
                >
                  <ThemedText style={[styles.category, categoryTextColor]}>
                    {category}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
          
          <ThemedText style={styles.description} numberOfLines={1}>{description}</ThemedText>
          
          <View style={styles.linkContainer}>
            <Ionicons 
              name={platformIcon()} 
              size={14} 
              color={Colors[colorScheme ?? 'light'].primaryBlue} 
            />
            <ThemedText style={styles.link}>{platformName}</ThemedText>
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    marginBottom: 4,
    fontFamily: 'Onest-SemiBold',
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    fontFamily: 'Onest-Medium',
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'Onest-Regular',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    opacity: 0.7,
    fontFamily: 'Onest-Regular',
    marginLeft: 4,
  },
});
