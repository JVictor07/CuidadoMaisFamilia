import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ImagePickerProps {
  label: string;
  imageUri?: string;
  onSelectImage: () => void;
  error?: string;
}

export function ImagePicker({ 
  label, 
  imageUri, 
  onSelectImage, 
  error 
}: ImagePickerProps) {
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? 'light'].text;
  const borderColor = error 
    ? '#FF3B30' 
    : Colors[colorScheme ?? 'light'].primaryBlue + '40';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.imageContainer,
          { 
            borderColor: borderColor,
            backgroundColor: Colors[colorScheme ?? 'light'].cardBackground
          }
        ]}
        onPress={onSelectImage}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons 
              name="camera" 
              size={40} 
              color={Colors[colorScheme ?? 'light'].primaryBlue} 
            />
            <Text style={[styles.placeholderText, { color: textColor + '80' }]}>
              Toque para selecionar uma imagem
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Onest-Medium',
    fontSize: 16,
    marginBottom: 8,
  },
  imageContainer: {
    height: 200,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Onest-Regular',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Onest-Regular',
  },
});
