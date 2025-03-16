import { StyleSheet, ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import { ImagePicker } from '@/components/ui/ImagePicker';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { specialties } from '@/data/specialties';
import { formatPhoneNumber } from '@/utils/formatters';
import { Professional } from '@/data/professionals';
import { addProfessional, uploadProfessionalImage } from '@/services/professionalService';

interface FormData {
  name: string;
  address: string;
  specialty: { id: string; name: string } | undefined;
  whatsapp: string;
  imageUrl: string;
}

interface FormErrors {
  name?: string;
  address?: string;
  specialty?: string;
  whatsapp?: string;
  imageUrl?: string;
}

export default function RegisterProfessionalScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    specialty: undefined,
    whatsapp: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleWhatsappChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('whatsapp', formatted);
  };

  const handleSpecialtySelect = (option: { id: string; name: string }) => {
    setFormData(prev => ({ ...prev, specialty: option }));
    if (errors.specialty) {
      setErrors(prev => ({ ...prev, specialty: undefined }));
    }
  };

  const handleImageSelect = () => {
    // In a real app, this would open an image picker
    // For now, we'll use a placeholder image
    const randomId = Math.floor(Math.random() * 100);
    const placeholderImage = `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${randomId}.jpg`;
    
    setFormData(prev => ({ ...prev, imageUrl: placeholderImage }));
    if (errors.imageUrl) {
      setErrors(prev => ({ ...prev, imageUrl: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }
    
    if (!formData.specialty) {
      newErrors.specialty = 'Especialidade é obrigatória';
    }
    
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp é obrigatório';
    } else if (formData.whatsapp.replace(/\D/g, '').length !== 11) {
      newErrors.whatsapp = 'WhatsApp inválido';
    }
    
    if (!formData.imageUrl) {
      newErrors.imageUrl = 'Imagem é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        
        // In a real implementation, you would upload the image to Firebase Storage
        // and get the download URL. For now, we'll just use the placeholder URL.
        let imageUrl = formData.imageUrl;
        
        // If this was a real image upload from device:
        // const fileName = `professional_${Date.now()}`;
        // imageUrl = await uploadProfessionalImage(formData.imageUrl, fileName);
        
        // Create the professional object
        const newProfessional: Omit<Professional, 'id'> = {
          name: formData.name,
          address: formData.address,
          specialty: formData.specialty?.name,
          whatsapp: formData.whatsapp,
          imageUrl: imageUrl,
        };
        
        // Save to Firestore
        const id = await addProfessional(newProfessional);
        
        Alert.alert(
          'Profissional Cadastrado',
          `${formData.name} foi cadastrado com sucesso!`,
          [
            { 
              text: 'OK', 
              onPress: () => router.back() 
            }
          ]
        );
      } catch (error) {
        console.error('Error saving professional:', error);
        Alert.alert(
          'Erro',
          'Ocorreu um erro ao cadastrar o profissional. Tente novamente.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <ImagePicker
          label="Foto do Profissional"
          imageUri={formData.imageUrl}
          onSelectImage={handleImageSelect}
          error={errors.imageUrl}
        />
        
        <FormInput
          label="Nome"
          placeholder="Nome completo do profissional"
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          error={errors.name}
        />
        
        <FormInput
          label="Endereço"
          placeholder="Endereço completo"
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
          error={errors.address}
        />
        
        <FormSelect
          label="Especialidade"
          options={specialties}
          selectedOption={formData.specialty}
          onSelect={handleSpecialtySelect}
          error={errors.specialty}
        />
        
        <FormInput
          label="WhatsApp"
          placeholder="(XX) 9XXXX-XXXX"
          value={formData.whatsapp}
          onChangeText={handleWhatsappChange}
          keyboardType="phone-pad"
          maxLength={16} // (XX) 9XXXX-XXXX = 16 characters
          error={errors.whatsapp}
        />
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue },
            isSubmitting && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <ThemedText style={styles.submitButtonText}>
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar Profissional'}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.8,
  },
  submitButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Onest-SemiBold',
  },
});
