import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FormInput } from "@/components/ui/FormInput";
import { FormMultiSelect } from "@/components/ui/FormMultiSelect";
import { ImagePicker as CustomImagePicker } from "@/components/ui/ImagePicker";
import { CustomAlert } from "@/components/ui/CustomAlert";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { specialties } from "@/data/specialties";
import { formatPhoneNumber } from "@/utils/formatters";
import { Professional } from "@/data/professionals";
import {
  addProfessional,
  updateProfessional,
  uploadProfessionalImage,
  getProfessionalById,
  deleteProfessional,
} from "@/services/professionalService";

interface FormData {
  name: string;
  address: string;
  specialties: { id: string; name: string }[];
  whatsapp: string;
  imageUrl: string;
  id?: string; // Optional id for editing
}

interface FormErrors {
  name?: string;
  address?: string;
  specialties?: string;
  whatsapp?: string;
  imageUrl?: string;
}

export default function RegisterProfessionalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const navigation = useNavigation();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    specialties: [],
    whatsapp: "",
    imageUrl: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Parse professional data from params if available
  useEffect(() => {
    const professionalId = params.id;
    if (professionalId && typeof professionalId === 'string') {
      // Set loading state if needed
      setIsLoading(true);
      
      // Fetch professional data by ID
      getProfessionalById(professionalId)
        .then(professionalData => {
          if (professionalData) {
            // Converter especialidades de string para objetos
            let specialtiesArray: { id: string; name: string }[] = [];
            
            if (professionalData.specialties && professionalData.specialties.length > 0) {
              // Mapear as especialidades para objetos
              specialtiesArray = professionalData.specialties.map(specialtyName => {
                const specialtyObj = specialties.find(s => s.name === specialtyName);
                return specialtyObj || { id: specialtyName, name: specialtyName };
              });
            }
            
            setFormData({
              id: professionalData.id,
              name: professionalData.name,
              address: professionalData.address,
              specialties: specialtiesArray,
              whatsapp: professionalData.whatsapp || "",
              imageUrl: professionalData.imageUrl,
            });
            
            setIsEditMode(true);
          }
        })
        .catch(error => {
          console.error("Error fetching professional data:", error);
          CustomAlert.alert(
            "Erro",
            "Não foi possível carregar os dados do profissional.",
            [{ text: "OK" }]
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);  // Empty dependency array - run only once on mount

  // Handle professional deletion
  const handleDeleteProfessional = () => {
    if (!formData.id) return;
    
    CustomAlert.alert(
      "Excluir Profissional",
      `Tem certeza que deseja excluir ${formData.name}? Esta ação não pode ser desfeita.`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await deleteProfessional(formData.id!);
              
              CustomAlert.alert(
                "Profissional Excluído",
                `${formData.name} foi excluído com sucesso!`,
                [
                  {
                    text: "OK",
                    onPress: () => router.replace({
                      pathname: '/(tabs)/professionals',
                      params: { refresh: Date.now().toString() }
                    }),
                  },
                ]
              );
            } catch (error) {
              console.error("Error deleting professional:", error);
              CustomAlert.alert(
                "Erro",
                "Não foi possível excluir o profissional. Tente novamente.",
                [{ text: "OK" }]
              );
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  // Update header title based on isEditMode
  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? "Editar Profissional" : "Registrar Profissional",
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ padding: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      ),
      headerRight: isEditMode ? () => (
        <TouchableOpacity 
          onPress={handleDeleteProfessional}
          style={{ padding: 10 }}
        >
          <Ionicons name="trash-outline" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      ) : undefined,
    });
  }, [isEditMode, colorScheme, navigation, router, formData.name]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (field in errors && errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleWhatsappChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange("whatsapp", formatted);
  };

  const handleSpecialtiesSelect = (options: { id: string; name: string }[]) => {
    setFormData((prev) => ({ 
      ...prev, 
      specialties: options
    }));
    if (errors.specialties) {
      setErrors((prev) => ({ ...prev, specialties: undefined }));
    }
  };

  const handleImageSelect = async () => {
    // Request permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      CustomAlert.alert(
        "Permissão Negada",
        "Precisamos de permissão para acessar sua galeria de fotos."
      );
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Just store the local URI temporarily - we'll upload it to Firebase when submitting
      setFormData((prev) => ({ ...prev, imageUrl: result.assets[0].uri }));
      if (errors.imageUrl) {
        setErrors((prev) => ({ ...prev, imageUrl: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Endereço é obrigatório";
    }

    if (!formData.specialties || formData.specialties.length === 0) {
      newErrors.specialties = "Pelo menos uma especialidade é obrigatória";
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "WhatsApp é obrigatório";
    } else if (formData.whatsapp.replace(/\D/g, "").length !== 11) {
      newErrors.whatsapp = "WhatsApp inválido";
    }

    if (!formData.imageUrl) {
      newErrors.imageUrl = "Imagem é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setIsSubmitting(true);

        // Upload the image to Firebase Storage and get the download URL
        let imageUrl = formData.imageUrl;
        
        // Only upload if it's a local URI (not already a remote URL)
        if (formData.imageUrl && !formData.imageUrl.startsWith('http')) {
          const fileName = `professional_${Date.now()}`;
          imageUrl = await uploadProfessionalImage(formData.imageUrl, fileName);
        }

        // Extrair os nomes das especialidades para salvar no Firestore
        const specialtyNames = formData.specialties.map(specialty => specialty.name);

        // Create the professional object
        const professionalData: Omit<Professional, "id"> = {
          name: formData.name,
          address: formData.address,
          specialties: specialtyNames,
          whatsapp: formData.whatsapp,
          imageUrl: imageUrl,
        };

        let successMessage = "";
        
        if (isEditMode && formData.id) {
          // Update existing professional
          await updateProfessional(formData.id, professionalData);
          successMessage = `${formData.name} foi atualizado com sucesso!`;
        } else {
          // Add new professional
          await addProfessional(professionalData);
          successMessage = `${formData.name} foi cadastrado com sucesso!`;
        }

        CustomAlert.alert(
          isEditMode ? "Profissional Atualizado" : "Profissional Cadastrado",
          successMessage,
          [
            {
              text: "OK",
              onPress: () => router.replace({
                pathname: '/(tabs)/professionals',
                params: { refresh: Date.now().toString() }
              }),
            },
          ]
        );
      } catch (error) {
        console.error("Error saving professional:", error);
        CustomAlert.alert(
          "Erro",
          `Ocorreu um erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} o profissional. Tente novamente.`,
          [{ text: "OK" }]
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primaryBlue} />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <CustomImagePicker
            label="Foto do Profissional"
            imageUri={formData.imageUrl}
            onSelectImage={handleImageSelect}
            error={errors.imageUrl}
          />

          <FormInput
            label="Nome"
            placeholder="Nome completo do profissional"
            value={formData.name}
            onChangeText={(value) => handleInputChange("name", value)}
            error={errors.name}
          />

          <FormInput
            label="Endereço"
            placeholder="Endereço completo"
            value={formData.address}
            onChangeText={(value) => handleInputChange("address", value)}
            error={errors.address}
          />

          <FormMultiSelect
            label="Especialidades"
            options={specialties}
            selectedOptions={formData.specialties}
            onSelect={handleSpecialtiesSelect}
            error={errors.specialties}
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
              { backgroundColor: Colors[colorScheme ?? "light"].primaryBlue },
              isSubmitting && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <ThemedText style={styles.submitButtonText}>
              {isSubmitting 
                ? (isEditMode ? "Atualizando..." : "Cadastrando...") 
                : (isEditMode ? "Atualizar Profissional" : "Cadastrar Profissional")}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
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
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Onest-SemiBold",
  },
});
