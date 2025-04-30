import React from 'react';
import { StyleSheet, Image, View, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ProfessionalCardProps {
  name: string;
  address: string;
  imageUrl: string;
  specialties: string[];
  onPress?: () => void;
}

export function ProfessionalCard({ 
  name, 
  address, 
  imageUrl, 
  specialties, 
  onPress 
}: ProfessionalCardProps) {
  const colorScheme = useColorScheme();
  const cardBgColor = { 
    backgroundColor: Colors[colorScheme ?? 'light'].cardBackground 
  };
  const specialtyBgColor = {
    backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue + '20' // Adding transparency
  };
  const specialtyTextColor = {
    color: Colors[colorScheme ?? 'light'].primaryBlue
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <ThemedView style={[styles.card, cardBgColor]}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.contentContainer}>
          <ThemedText type="defaultSemiBold" style={styles.name}>{name}</ThemedText>
          
          {specialties.length > 0 && (
            <View style={styles.specialtiesRow}>
              {specialties.map((spec, index) => (
                <View 
                  key={index} 
                  style={[styles.specialtyContainer, specialtyBgColor]}
                >
                  <ThemedText style={[styles.specialty, specialtyTextColor]}>
                    {spec}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
          
          <ThemedText style={styles.address}>{address}</ThemedText>
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
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  specialtyContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  specialty: {
    fontSize: 12,
    fontFamily: 'Onest-Medium',
  },
  address: {
    fontSize: 14,
    opacity: 0.7,
    fontFamily: 'Onest-Regular',
  },
});
