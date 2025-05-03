import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';

import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { updateUserPassword } from '@/services/authService';
import { CustomAlert } from '../ui/CustomAlert';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

type FormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const colorScheme = useColorScheme();
  const primaryColor = Colors[colorScheme ?? 'light'].primaryBlue;
  const backgroundColor = Colors[colorScheme ?? 'light'].cardBackground;
  const textColor = Colors[colorScheme ?? 'light'].text;
  const errorColor = Colors[colorScheme ?? 'light'].error;
  
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  
  const newPassword = watch('newPassword');
  
  const resetForm = () => {
    reset();
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setGeneralError('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setGeneralError('');
    
    try {
      await updateUserPassword(data.currentPassword, data.newPassword);
      setIsLoading(false);
      CustomAlert.alert('Sucesso', 'Sua senha foi alterada com sucesso!');
      handleClose();
    } catch (error: any) {
      setIsLoading(false);
      
      // Tratamento de erros específicos do Firebase
      if (error.code === 'auth/wrong-password') {
        return { currentPassword: 'Senha atual incorreta. Por favor, verifique e tente novamente.' };
      } else if (error.code === 'auth/weak-password') {
        return { newPassword: 'A nova senha é muito fraca. Escolha uma senha mais forte.' };
      } else if (error.code === 'auth/requires-recent-login') {
        setGeneralError('Esta operação é sensível e requer autenticação recente. Por favor, faça login novamente.');
      } else {
        setGeneralError('Ocorreu um erro ao alterar sua senha. Tente novamente.');
      }
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
            <ThemedText style={styles.title}>Alterar Senha</ThemedText>
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
          
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Senha Atual</ThemedText>
            <Controller
              control={control}
              rules={{
                required: 'Por favor, informe sua senha atual'
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        color: textColor, 
                        borderColor: errors.currentPassword 
                          ? errorColor 
                          : Colors[colorScheme ?? 'light'].text + '40' 
                      }
                    ]}
                    placeholder="Digite sua senha atual"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
                    secureTextEntry={!showCurrentPassword}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <Ionicons 
                      name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color={Colors[colorScheme ?? 'light'].text + '80'} 
                    />
                  </TouchableOpacity>
                </View>
              )}
              name="currentPassword"
            />
            {errors.currentPassword && (
              <ThemedText style={[styles.errorText, { color: errorColor }]}>
                {errors.currentPassword.message}
              </ThemedText>
            )}
            
            <ThemedText style={styles.label}>Nova Senha</ThemedText>
            <Controller
              control={control}
              rules={{
                required: 'Por favor, informe a nova senha',
                minLength: {
                  value: 6,
                  message: 'A nova senha deve ter pelo menos 6 caracteres'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        color: textColor, 
                        borderColor: errors.newPassword 
                          ? errorColor 
                          : Colors[colorScheme ?? 'light'].text + '40' 
                      }
                    ]}
                    placeholder="Digite sua nova senha"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
                    secureTextEntry={!showNewPassword}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons 
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color={Colors[colorScheme ?? 'light'].text + '80'} 
                    />
                  </TouchableOpacity>
                </View>
              )}
              name="newPassword"
            />
            {errors.newPassword && (
              <ThemedText style={[styles.errorText, { color: errorColor }]}>
                {errors.newPassword.message}
              </ThemedText>
            )}
            
            <ThemedText style={styles.label}>Confirmar Nova Senha</ThemedText>
            <Controller
              control={control}
              rules={{
                required: 'Por favor, confirme a nova senha',
                validate: value => value === newPassword || 'A confirmação da senha não corresponde à nova senha'
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        color: textColor, 
                        borderColor: errors.confirmPassword 
                          ? errorColor 
                          : Colors[colorScheme ?? 'light'].text + '40' 
                      }
                    ]}
                    placeholder="Confirme sua nova senha"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
                    secureTextEntry={!showConfirmPassword}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color={Colors[colorScheme ?? 'light'].text + '80'} 
                    />
                  </TouchableOpacity>
                </View>
              )}
              name="confirmPassword"
            />
            {errors.confirmPassword && (
              <ThemedText style={[styles.errorText, { color: errorColor }]}>
                {errors.confirmPassword.message}
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
                <ThemedText style={[styles.buttonText, { color: 'white' }]}>Alterar</ThemedText>
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
    fontFamily: 'Onest-Medium',
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    width: '100%',
    fontFamily: 'Onest-Regular',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 15,
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
