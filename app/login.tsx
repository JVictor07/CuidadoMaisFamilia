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
import { signInUser } from '@/services/authService';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        await signInUser(email, password);
        router.replace('/(tabs)/professionals');
      } catch (error: any) {
        let errorMessage = 'Ocorreu um erro ao fazer login. Tente novamente.';
        
        // Handle specific Firebase auth errors
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          errorMessage = 'Email ou senha incorretos.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
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

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <ThemedText style={styles.title}>Login</ThemedText>
            <ThemedText style={styles.subtitle}>
              Entre com suas credenciais para acessar o sistema
            </ThemedText>

            <FormInput
              label="Email"
              placeholder="Seu email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <View style={styles.passwordContainer}>
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
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                { backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue },
                isLoading && styles.disabledButton,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText style={styles.loginButtonText}>Entrar</ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => router.push('/forgot-password')}
            >
              <ThemedText style={styles.forgotPasswordText}>
                Esqueceu sua senha?
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <ThemedText style={styles.signupText}>Não tem uma conta?</ThemedText>
              <TouchableOpacity
                style={styles.signupButton}
                onPress={() => router.push('/signup')}
              >
                <ThemedText style={styles.signupButtonText}>Cadastre-se</ThemedText>
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
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 140,
    height: 140,
  },
  appName: {
    fontSize: 24,
    fontFamily: 'Onest-SemiBold',
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
  passwordContainer: {
    marginBottom: 24,
  },
  loginButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Onest-SemiBold',
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    padding: 8,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Onest-Medium',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    marginRight: 4,
  },
  signupButton: {
    padding: 4,
  },
  signupButtonText: {
    fontSize: 14,
    fontFamily: 'Onest-Medium',
    color: Colors.light.primaryBlue,
  },
});
