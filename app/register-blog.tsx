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
import { categories } from "@/data/categories";
import { Blog } from "@/data/blogs";
import {
  addBlog,
  updateBlog,
  uploadBlogImage,
  getBlogById,
  deleteBlog,
} from "@/services/blogService";

interface FormData {
  name: string;
  link: string;
  categories: { id: string; name: string }[];
  imageUrl: string;
  id?: string; // Optional id for editing
}

interface FormErrors {
  name?: string;
  link?: string;
  categories?: string;
  imageUrl?: string;
}

export default function RegisterBlogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const navigation = useNavigation();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    link: "",
    categories: [],
    imageUrl: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Parse blog data from params if available
  useEffect(() => {
    const blogId = params.id;
    if (blogId && typeof blogId === 'string') {
      // Set loading state if needed
      setIsLoading(true);
      
      // Fetch blog data by ID
      getBlogById(blogId)
        .then(blogData => {
          if (blogData) {
            // Converter categorias de string para objetos
            let categoriesArray: { id: string; name: string }[] = [];
            
            if (blogData.categories && blogData.categories.length > 0) {
              // Mapear as categorias para objetos
              categoriesArray = blogData.categories.map(categoryName => {
                const categoryObj = categories.find(c => c.name === categoryName);
                return categoryObj || { id: categoryName, name: categoryName };
              });
            }
            
            setFormData({
              id: blogData.id,
              name: blogData.name,
              link: blogData.link,
              categories: categoriesArray,
              imageUrl: blogData.imageUrl,
            });
            
            setIsEditMode(true);
          }
        })
        .catch(error => {
          console.error("Error fetching blog data:", error);
          CustomAlert.alert(
            "Erro",
            "Não foi possível carregar os dados do blog.",
            [{ text: "OK" }]
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);  // Empty dependency array - run only once on mount

  // Handle blog deletion
  const handleDeleteBlog = () => {
    if (!isEditMode || !formData.id) return;
    
    CustomAlert.alert(
      "Excluir Blog",
      `Tem certeza que deseja excluir "${formData.name}"? Esta ação não pode ser desfeita.`,
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
              // Use non-null assertion since we already checked above
              await deleteBlog(formData.id!);
              
              CustomAlert.alert(
                "Blog Excluído",
                `${formData.name} foi excluído com sucesso!`,
                [
                  {
                    text: "OK",
                    onPress: () => router.replace({
                      pathname: '/(tabs)/blogs',
                      params: { refresh: Date.now().toString() }
                    }),
                  },
                ]
              );
            } catch (error) {
              console.error("Error deleting blog:", error);
              CustomAlert.alert(
                "Erro",
                "Não foi possível excluir o blog. Tente novamente.",
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
      title: isEditMode ? "Editar Blog" : "Registrar Blog",
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
          onPress={handleDeleteBlog}
          style={{ padding: 10 }}
        >
          <Ionicons name="trash-outline" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      ) : undefined,
    });
  }, [isEditMode, colorScheme, navigation, router, formData.name, formData.id]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field if it exists
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCategoriesSelect = (options: { id: string; name: string }[]) => {
    setFormData(prev => ({
      ...prev,
      categories: options
    }));
    
    // Clear categories error if it exists
    if (errors.categories) {
      setErrors(prev => ({ ...prev, categories: undefined }));
    }
  };

  const handleImageSelect = async () => {
    try {
      // Request permission to access the image library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        CustomAlert.alert(
          "Permissão negada",
          "Precisamos de permissão para acessar suas fotos.",
          [{ text: "OK" }]
        );
        return;
      }
      
      // Launch the image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData(prev => ({
          ...prev,
          imageUrl: result.assets[0].uri
        }));
        
        // Clear imageUrl error if it exists
        if (errors.imageUrl) {
          setErrors(prev => ({ ...prev, imageUrl: undefined }));
        }
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      CustomAlert.alert(
        "Erro",
        "Ocorreu um erro ao selecionar a imagem. Tente novamente.",
        [{ text: "OK" }]
      );
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
      isValid = false;
    }
    
    // Validate imageUrl
    if (!formData.imageUrl) {
      newErrors.imageUrl = "Imagem é obrigatória";
      isValid = false;
    }
    
    // Validate categories
    if (formData.categories.length === 0) {
      newErrors.categories = "Selecione pelo menos uma categoria";
      isValid = false;
    }
    
    // Validate link
    if (!formData.link.trim()) {
      newErrors.link = "Link é obrigatório";
      isValid = false;
    } else {
      try {
        new URL(formData.link);
      } catch (error) {
        newErrors.link = "Link inválido. Inclua http:// ou https://";
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = formData.imageUrl;
      
      // If a new image was selected (it's a local URI), upload it
      if (formData.imageUrl && !formData.imageUrl.startsWith('http')) {
        const fileName = `blog_${Date.now()}`;
        imageUrl = await uploadBlogImage(formData.imageUrl, fileName);
      }
      
      // Extract category names from the selected categories
      const categoryNames = formData.categories.map(cat => cat.name);
      
      // Prepare the blog data
      const blogData = {
        name: formData.name,
        link: formData.link,
        categories: categoryNames,
        imageUrl: imageUrl,
      };

      let successMessage = "";
      
      if (isEditMode && formData.id) {
        // Update existing blog
        await updateBlog(formData.id, blogData);
        successMessage = `${formData.name} foi atualizado com sucesso!`;
      } else {
        // Add new blog
        await addBlog(blogData);
        successMessage = `${formData.name} foi cadastrado com sucesso!`;
      }

      CustomAlert.alert(
        isEditMode ? "Blog Atualizado" : "Blog Cadastrado",
        successMessage,
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to the blogs tab with a refresh parameter
              router.replace({
                pathname: '/(tabs)/blogs',
                params: { refresh: Date.now().toString() }
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error saving blog:", error);
      CustomAlert.alert(
        "Erro",
        `Ocorreu um erro ao ${isEditMode ? 'atualizar' : 'cadastrar'} o blog. Tente novamente.`,
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
          <CustomImagePicker
            label="Imagem do Blog"
            imageUri={formData.imageUrl}
            onSelectImage={handleImageSelect}
            error={errors.imageUrl}
          />

          <FormInput
            label="Nome"
            placeholder="Nome do blog"
            value={formData.name}
            onChangeText={(value) => handleInputChange("name", value)}
            error={errors.name}
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
            placeholder="Link do blog (https://exemplo.com)"
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
                : (isEditMode ? "Atualizar Blog" : "Cadastrar Blog")}
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
