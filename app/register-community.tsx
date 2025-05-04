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
import { useForm, Controller } from 'react-hook-form';

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

type FormData = {
  name: string;
  description: string;
  link: string;
  categories: { id: string; name: string }[];
  imageUrl: string;
  id?: string; // Optional id for editing
};

export default function RegisterCommunityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      link: "",
      categories: [],
      imageUrl: "",
    }
  });

  const watchedValues = watch();

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
            
            // Atualizar os valores do formulário usando setValue
            setValue('id', communityData.id);
            setValue('name', communityData.name);
            setValue('description', communityData.description);
            setValue('link', communityData.link);
            setValue('categories', categoriesArray);
            setValue('imageUrl', communityData.imageUrl);
            
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
  }, [isEditMode, navigation, colorScheme, router]);

  const handleCategoriesSelect = (options: { id: string; name: string }[]) => {
    setValue('categories', options, { shouldValidate: true });
  };

  const handleImageSelect = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setValue('imageUrl', selectedImage.uri, { shouldValidate: true });
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      CustomAlert.alert(
        "Erro",
        "Não foi possível selecionar a imagem. Tente novamente.",
        [{ text: "OK" }]
      );
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Upload image if it's a local URI (not a URL)
      let imageUrl = data.imageUrl;
      if (data.imageUrl && !data.imageUrl.startsWith('http')) {
        imageUrl = await uploadCommunityImage(data.imageUrl);
      }

      // Extract category names for storage
      const categoryNames = data.categories.map(cat => cat.name);

      // Prepare community data for saving
      const communityData: Community = {
        id: data.id || '', // Will be generated by Firebase if new
        name: data.name,
        description: data.description,
        link: data.link,
        categories: categoryNames,
        imageUrl: imageUrl,
      };

      let successMessage = "";
      
      if (isEditMode && data.id) {
        // Update existing community
        await updateCommunity(data.id, communityData);
        successMessage = `${data.name} foi atualizada com sucesso!`;
      } else {
        // Add new community
        await addCommunity(communityData);
        successMessage = `${data.name} foi cadastrada com sucesso!`;
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
  };

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primaryBlue} />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <Controller
            control={control}
            rules={{
              required: 'A imagem da comunidade é obrigatória'
            }}
            render={({ field: { value } }) => (
              <CustomImagePicker
                label="Imagem da Comunidade"
                imageUri={value}
                onSelectImage={handleImageSelect}
                error={errors.imageUrl?.message}
              />
            )}
            name="imageUrl"
          />

          <Controller
            control={control}
            rules={{
              required: 'O nome da comunidade é obrigatório',
              minLength: {
                value: 3,
                message: 'O nome deve ter pelo menos 3 caracteres'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Nome"
                placeholder="Nome da comunidade"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
              />
            )}
            name="name"
          />

          <Controller
            control={control}
            rules={{
              required: 'A descrição da comunidade é obrigatória',
              minLength: {
                value: 10,
                message: 'A descrição deve ter pelo menos 10 caracteres'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Descrição"
                placeholder="Descreva o propósito da comunidade"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                multiline
                numberOfLines={3}
              />
            )}
            name="description"
          />

          <Controller
            control={control}
            rules={{
              required: 'Selecione pelo menos uma categoria',
              validate: value => value.length > 0 || 'Selecione pelo menos uma categoria'
            }}
            render={({ field: { value } }) => (
              <FormMultiSelect
                label="Categorias"
                options={categories}
                selectedOptions={value}
                onSelect={handleCategoriesSelect}
                error={errors.categories?.message}
              />
            )}
            name="categories"
          />

          <Controller
            control={control}
            rules={{
              required: 'O link da comunidade é obrigatório',
              pattern: {
                value: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                message: 'Insira um link válido'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Link"
                placeholder="Link para a comunidade (WhatsApp, Telegram, etc.)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.link?.message}
              />
            )}
            name="link"
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: Colors[colorScheme ?? "light"].primaryBlue },
              isSubmitting && styles.disabledButton,
            ]}
            onPress={handleSubmit(onSubmit)}
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
