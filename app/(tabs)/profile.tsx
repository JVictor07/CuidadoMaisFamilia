import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CustomAlert } from '@/components/ui/CustomAlert';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { signOutUser } from '@/services/authService';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user, userRole, isAdmin, checkUserRole } = useAuth();
  const primaryColor = Colors[colorScheme ?? 'light'].primaryBlue;
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);

  // Verificar a role do usuário ao carregar o componente
  useEffect(() => {
    checkUserRole();
  }, []);

  const handleLogout = async () => {
    CustomAlert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOutUser();
              router.replace('/login');
            } catch (error) {
              console.error('Error signing out:', error);
              CustomAlert.alert('Erro', 'Ocorreu um erro ao tentar sair. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: primaryColor },
                ]}
              >
                <ThemedText style={styles.avatarInitial}>
                  {user.displayName ? user.displayName[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : '?'}
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={styles.userName}>
            {user.displayName || 'Usuário'}
          </ThemedText>
          <ThemedText style={styles.userEmail}>{user.email}</ThemedText>
          
          {/* Exibir a role do usuário */}
          <View style={[styles.roleBadge, { backgroundColor: isAdmin ? Colors[colorScheme ?? 'light'].error : primaryColor }]}>
            <ThemedText style={styles.roleText}>
              {userRole === 'admin' ? 'Administrador' : 'Usuário'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.menuSection}>
          <ThemedText style={styles.sectionTitle}>Configurações</ThemedText>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => CustomAlert.alert('Informação', 'Funcionalidade em desenvolvimento')}
          >
            <Ionicons
              name="person-outline"
              size={24}
              color={Colors[colorScheme ?? 'light'].text}
            />
            <ThemedText style={styles.menuItemText}>Editar Perfil</ThemedText>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors[colorScheme ?? 'light'].text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setChangePasswordModalVisible(true)}
          >
            <Ionicons
              name="lock-closed-outline"
              size={24}
              color={Colors[colorScheme ?? 'light'].text}
            />
            <ThemedText style={styles.menuItemText}>Alterar Senha</ThemedText>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors[colorScheme ?? 'light'].text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <ThemedText style={styles.sectionTitle}>Sobre</ThemedText>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              CustomAlert.alert('Sobre', 'Cuidado Mais Família v1.0.0\n\nUm aplicativo para gerenciamento de profissionais de saúde.');
            }}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={Colors[colorScheme ?? 'light'].text}
            />
            <ThemedText style={styles.menuItemText}>Sobre o Aplicativo</ThemedText>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors[colorScheme ?? 'light'].text}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: Colors[colorScheme ?? 'light'].error }]}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color={Colors[colorScheme ?? 'light'].error}
          />
          <ThemedText style={[styles.logoutText, { color: Colors[colorScheme ?? 'light'].error }]}>
            Sair
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
      <ChangePasswordModal 
        visible={changePasswordModalVisible}
        onClose={() => setChangePasswordModalVisible(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    fontFamily: 'Onest-Bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Onest-SemiBold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.7,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Onest-SemiBold',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Onest-Medium',
    marginLeft: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    lineHeight: 12,
    fontFamily: 'Onest-Medium',
    textAlign: 'center',
  },
});
