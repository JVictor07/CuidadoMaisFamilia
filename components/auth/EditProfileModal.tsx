import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { updateUserProfile, uploadUserProfileImage } from '@/services/authService';
import { CustomAlert } from '../ui/CustomAlert';
import { User } from '@/services/authService';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: User | null;
  onProfileUpdate?: () => void;
}

type FormData = {
  displayName: string;
  photoURL: string;
};

export function EditProfileModal({ visible, onClose, user, onProfileUpdate }: EditProfileModalProps) {
  const colorScheme = useColorScheme();
  const primaryColor = Colors[colorScheme ?? 'light'].primaryBlue;
  const backgroundColor = Colors[colorScheme ?? 'light'].cardBackground;
  const textColor = Colors[colorScheme ?? 'light'].text;
  const errorColor = Colors[colorScheme ?? 'light'].error;
  
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    defaultValues: {
      displayName: user?.displayName || '',
      photoURL: user?.photoURL || '',
    }
  });
  
  // Reset form when user changes or modal opens
  React.useEffect(() => {
    if (visible && user) {
      reset({
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      });
      setSelectedImage(user.photoURL);
    }
  }, [visible, user, reset]);
  
  const resetForm = () => {
    reset();
    setSelectedImage(null);
    setGeneralError('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setValue('photoURL', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      CustomAlert.alert('Erro', 'Não foi possível selecionar a imagem. Tente novamente.');
    }
  };
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setGeneralError('');
    
    try {
      let photoURL = data.photoURL;
      
      // If there's a selected image that's different from the current user photo,
      // upload it to Firebase Storage first
      if (selectedImage && selectedImage !== user?.photoURL) {
        photoURL = await uploadUserProfileImage(selectedImage);
      }
      
      // Update user profile with the display name and the photo URL (which might be the uploaded image URL)
      await updateUserProfile(data.displayName, photoURL);
      setIsLoading(false);
      CustomAlert.alert('Sucesso', 'Seu perfil foi atualizado com sucesso!');
      
      // Call the onProfileUpdate callback if provided
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      
      handleClose();
    } catch (error: any) {
      setIsLoading(false);
      console.error('Error updating profile:', error);
      setGeneralError('Ocorreu um erro ao atualizar seu perfil. Tente novamente.');
    }
  };
  
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.centeredView}>
        <ThemedView style={[styles.modalView, { backgroundColor }]}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Editar Perfil</ThemedText>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          
          {generalError ? (
            <View style={styles.errorContainer}>
              <ThemedText style={[styles.errorText, { color: errorColor }]}>
                {generalError}
              </ThemedText>
            </View>
          ) : null}
          
          <View style={styles.avatarContainer}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: primaryColor },
                ]}
              >
                <ThemedText style={styles.avatarInitial}>
                  {user?.displayName ? user.displayName[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : '?'}
                </ThemedText>
              </View>
            )}
            <TouchableOpacity 
              style={[styles.changePhotoButton, { backgroundColor: primaryColor }]}
              onPress={pickImage}
            >
              <Ionicons name="camera-outline" size={16} color="white" />
              <ThemedText style={styles.changePhotoText}>Alterar foto</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Nome de Exibição</ThemedText>
            <Controller
              control={control}
              rules={{
                required: 'Por favor, informe seu nome de exibição',
                minLength: {
                  value: 3,
                  message: 'O nome deve ter pelo menos 3 caracteres'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      color: textColor, 
                      borderColor: errors.displayName 
                        ? errorColor 
                        : Colors[colorScheme ?? 'light'].text + '40' 
                    }
                  ]}
                  placeholder="Seu nome"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
              name="displayName"
            />
            {errors.displayName && (
              <ThemedText style={[styles.errorText, { color: errorColor }]}>
                {errors.displayName.message}
              </ThemedText>
            )}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={isLoading}
            >
              <ThemedText style={styles.buttonText}>Cancelar</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: primaryColor }]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <ThemedText style={[styles.buttonText, { color: 'white' }]}>Salvar</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Onest-SemiBold',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarInitial: {
    fontSize: 40,
    fontFamily: 'Onest-Bold',
    color: 'white',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  changePhotoText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'Onest-Medium',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    width: '100%',
    fontFamily: 'Onest-Regular',
  },
  errorContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Onest-Regular',
    marginTop: 4,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  confirmButton: {
    minWidth: 120,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Onest-Medium',
  },
});
