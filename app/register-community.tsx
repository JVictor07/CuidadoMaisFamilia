import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  View,
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
import { categories } from "@/data/categories";
import { Community } from "@/data/communities";
import {
  addCommunity,
  updateCommunity,
  uploadCommunityImage,
  getCommunityById,
} from "@/services/communityService";

interface FormData {
  name: string;
  description: string;
  link: string;
  categories: { id: string; name: string }[];
  imageUrl: string;
  id?: string; // Optional id for editing
}

interface FormErrors {
  name?: string;
  description?: string;
  link?: string;
  categories?: string;
  imageUrl?: string;
}

export default function RegisterCommunityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const navigation = useNavigation();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    link: "",
    categories: [],
    imageUrl: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Parse community data from params if available
  useEffect(() => {
    const communityId = params.id;
    if (communityId && typeof communityId === 'string') {
      // Set loading state if needed
      setIsLoading(true);
      
      // Fetch community data by ID
      getCommunityById(communityId)
        .then(communityData => {
          if (communityData) {
            // Converter categorias de string para objetos
            let categoriesArray: { id: string; name: string }[] = [];
            
            if (communityData.categories && communityData.categories.length > 0) {
              // Mapear as categorias para objetos
              categoriesArray = communityData.categories.map(categoryName => {
                const categoryObj = categories.find(c => c.name === categoryName);
                return categoryObj || { id: categoryName, name: categoryName };
              });
            }
            
            setFormData({
              id: communityData.id,
              name: communityData.name,
              description: communityData.description,
              link: communityData.link,
              categories: categoriesArray,
              imageUrl: communityData.imageUrl,
            });
            
            setIsEditMode(true);
          }
        })
        .catch(error => {
          console.error("Error fetching community data:", error);
          CustomAlert.alert(
            "Erro",
            "Não foi possível carregar os dados da comunidade.",
            [{ text: "OK" }]
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);  // Empty dependency array - run only once on mount

  // Update header title based on isEditMode
  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? "Editar Comunidade" : "Registrar Comunidade",
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ padding: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      ),
    });
  }, [isEditMode, navigation, router, colorScheme]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (field in errors && errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCategoriesSelect = (options: { id: string; name: string }[]) => {
    setFormData((prev) => ({ 
      ...prev, 
      categories: options
    }));
    if (errors.categories) {
      setErrors((prev) => ({ ...prev, categories: undefined }));
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

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (!formData.link.trim()) {
      newErrors.link = "Link é obrigatório";
    } else if (!formData.link.startsWith('http')) {
      newErrors.link = "Link deve começar com http:// ou https://";
    }

    if (!formData.categories || formData.categories.length === 0) {
      newErrors.categories = "Pelo menos uma categoria é obrigatória";
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
          const fileName = `community_${Date.now()}`;
          imageUrl = await uploadCommunityImage(formData.imageUrl, fileName);
        }

        // Extrair os nomes das categorias para salvar no Firestore
        const categoryNames = formData.categories.map(category => category.name);

        // Create the community object
        const communityData: Omit<Community, "id"> = {
          name: formData.name,
          description: formData.description,
          link: formData.link,
          categories: categoryNames,
          imageUrl: imageUrl,
        };

        let successMessage = "";
        
        if (isEditMode && formData.id) {
          // Update existing community
          await updateCommunity(formData.id, communityData);
          successMessage = `${formData.name} foi atualizada com sucesso!`;
        } else {
          // Add new community
          await addCommunity(communityData);
          successMessage = `${formData.name} foi cadastrada com sucesso!`;
        }

        CustomAlert.alert(
          isEditMode ? "Comunidade Atualizada" : "Comunidade Cadastrada",
          successMessage,
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } catch (error) {
        console.error("Error saving community:", error);
        CustomAlert.alert(
          "Erro",
          `Ocorreu um erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} a comunidade. Tente novamente.`,
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
            label="Imagem da Comunidade"
            imageUri={formData.imageUrl}
            onSelectImage={handleImageSelect}
            error={errors.imageUrl}
          />

          <FormInput
            label="Nome"
            placeholder="Nome da comunidade"
            value={formData.name}
            onChangeText={(value) => handleInputChange("name", value)}
            error={errors.name}
          />

          <FormInput
            label="Descrição"
            placeholder="Descreva o propósito da comunidade"
            value={formData.description}
            onChangeText={(value) => handleInputChange("description", value)}
            error={errors.description}
            multiline
            numberOfLines={4}
          />

          <FormMultiSelect
            label="Categorias"
            options={categories}
            selectedOptions={formData.categories}
            onSelect={handleCategoriesSelect}
            error={errors.categories}
          />

          <FormInput
            label="Link"
            placeholder="Link para a comunidade (WhatsApp, Telegram, etc.)"
            value={formData.link}
            onChangeText={(value) => handleInputChange("link", value)}
            error={errors.link}
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
                : (isEditMode ? "Atualizar Comunidade" : "Cadastrar Comunidade")}
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
