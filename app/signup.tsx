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
import { registerUser, updateUserProfile } from '@/services/authService';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        const user = await registerUser(email, password);
        
        // Update user profile with display name
        await updateUserProfile(name);
        
        CustomAlert.alert(
          'Conta Criada',
          'Sua conta foi criada com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/professionals'),
            },
          ]
        );
      } catch (error: any) {
        let errorMessage = 'Ocorreu um erro ao criar sua conta. Tente novamente.';
        
        // Handle specific Firebase auth errors
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'Este email já está sendo usado por outra conta.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Email inválido.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Senha muito fraca. Use uma senha mais forte.';
        }
        
        CustomAlert.alert('Erro', errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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

          <View style={styles.formContainer}>
            <ThemedText style={styles.title}>Criar Conta</ThemedText>
            <ThemedText style={styles.subtitle}>
              Preencha os campos abaixo para criar sua conta
            </ThemedText>

            <FormInput
              label="Nome"
              placeholder="Seu nome completo"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              error={errors.name}
            />

            <FormInput
              label="Email"
              placeholder="Seu email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <FormInput
              label="Senha"
              placeholder="Sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={errors.password}
              rightIcon={
                <TouchableOpacity onPress={togglePasswordVisibility}>
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color={Colors[colorScheme ?? 'light'].text}
                  />
                </TouchableOpacity>
              }
            />

            <FormInput
              label="Confirmar Senha"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              error={errors.confirmPassword}
              rightIcon={
                <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color={Colors[colorScheme ?? 'light'].text}
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              style={[
                styles.signupButton,
                { backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText style={styles.signupButtonText}>Criar Conta</ThemedText>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <ThemedText style={styles.loginText}>Já tem uma conta?</ThemedText>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.replace('/login')}
              >
                <ThemedText style={styles.loginButtonText}>Fazer Login</ThemedText>
              </TouchableOpacity>
            </View>
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
  appName: {
    fontSize: 20,
    fontFamily: 'Onest-SemiBold',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    marginVertical: "auto",
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
  signupButton: {
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
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Onest-SemiBold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginButton: {
    padding: 4,
  },
  loginButtonText: {
    fontSize: 14,
    fontFamily: 'Onest-Medium',
    color: Colors.light.primaryBlue,
  },
});
