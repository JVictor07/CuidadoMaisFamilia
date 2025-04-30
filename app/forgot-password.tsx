import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FormInput } from '@/components/ui/FormInput';
import { CustomAlert } from '@/components/ui/CustomAlert';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { resetPassword } from '@/services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setError('Email é obrigatório');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido');
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleResetPassword = async () => {
    if (validateEmail()) {
      setIsLoading(true);
      try {
        await resetPassword(email);
        setResetSent(true);
        CustomAlert.alert(
          'Email Enviado',
          'Instruções para redefinir sua senha foram enviadas para o seu email.',
          [{ text: 'OK' }]
        );
      } catch (error: any) {
        let errorMessage = 'Ocorreu um erro ao enviar o email. Tente novamente.';
        
        // Handle specific Firebase auth errors
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'Não existe uma conta com este email.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Email inválido.';
        }
        
        CustomAlert.alert('Erro', errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].text} 
            />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <ThemedText style={styles.title}>Esqueceu a senha?</ThemedText>
            <ThemedText style={styles.subtitle}>
              Digite seu email para receber instruções de redefinição de senha
            </ThemedText>

            <FormInput
              label="Email"
              placeholder="Seu email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(undefined);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={error}
            />

            <TouchableOpacity
              style={[
                styles.resetButton,
                { backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleResetPassword}
              disabled={isLoading || resetSent}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText style={styles.resetButtonText}>
                  {resetSent ? 'Email Enviado' : 'Enviar Email'}
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.replace('/login')}
            >
              <ThemedText style={styles.loginButtonText}>
                Voltar para o Login
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    padding: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Onest-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
  },
  resetButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Onest-SemiBold',
  },
  loginButton: {
    alignSelf: 'center',
    padding: 8,
  },
  loginButtonText: {
    fontSize: 14,
    fontFamily: 'Onest-Medium',
  },
});
