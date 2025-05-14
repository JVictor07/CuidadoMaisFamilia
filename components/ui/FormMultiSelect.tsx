import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Option {
  id: string;
  name: string;
}

interface FormMultiSelectProps {
  label: string;
  options: Option[];
  selectedOptions: Option[];
  onSelect: (options: Option[]) => void;
  error?: string;
}

export function FormMultiSelect({ 
  label, 
  options, 
  selectedOptions, 
  onSelect, 
  error 
}: FormMultiSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? 'light'].text;
  const borderColor = error 
    ? '#FF3B30' 
    : Colors[colorScheme ?? 'light'].primaryBlue + '40';
  const backgroundColor = Colors[colorScheme ?? 'light'].cardBackground;

  // Função para alternar a seleção de uma opção
  const toggleOption = (option: Option) => {
    let newSelectedOptions: Option[];
    
    // Verifica se a opção já está selecionada
    const isSelected = selectedOptions.some(item => item.id === option.id);
    
    if (isSelected) {
      // Remove a opção da lista de selecionados
      newSelectedOptions = selectedOptions.filter(item => item.id !== option.id);
    } else {
      // Adiciona a opção à lista de selecionados
      newSelectedOptions = [...selectedOptions, option];
    }
    
    onSelect(newSelectedOptions);
  };

  // Formata o texto a ser exibido no botão
  const getDisplayText = () => {
    if (selectedOptions.length === 0) {
      return 'Selecione as especialidades';
    } else if (selectedOptions.length === 1) {
      return selectedOptions[0].name;
    } else {
      return `${selectedOptions.length} especialidades selecionadas`;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.selectButton,
          { 
            borderColor: borderColor,
            backgroundColor: backgroundColor
          }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text 
          style={[
            styles.selectText, 
            { 
              color: selectedOptions.length > 0 ? textColor : textColor + '80'
            }
          ]}
        >
          {getDisplayText()}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={Colors[colorScheme ?? 'light'].primaryBlue} 
        />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Lista de chips para mostrar as opções selecionadas */}
      {selectedOptions.length > 0 && (
        <View style={styles.chipsContainer}>
          {selectedOptions.map(option => (
            <View 
              key={option.id} 
              style={[
                styles.chip, 
                { backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue + '20' }
              ]}
            >
              <Text 
                style={[
                  styles.chipText, 
                  { color: Colors[colorScheme ?? 'light'].primaryBlue }
                ]}
              >
                {option.name}
              </Text>
              <TouchableOpacity
                style={styles.chipRemove}
                onPress={() => toggleOption(option)}
              >
                <Ionicons 
                  name="close-circle" 
                  size={18} 
                  color={Colors[colorScheme ?? 'light'].primaryBlue} 
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View 
            style={[
              styles.modalContent,
              { backgroundColor: backgroundColor }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={Colors[colorScheme ?? 'light'].primaryBlue} 
                />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedOptions.some(option => option.id === item.id);
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      isSelected && { 
                        backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue + '20' 
                      }
                    ]}
                    onPress={() => toggleOption(item)}
                  >
                    <Text 
                      style={[
                        styles.optionText, 
                        { color: textColor },
                        isSelected && { 
                          color: Colors[colorScheme ?? 'light'].primaryBlue,
                          fontFamily: 'Onest-SemiBold'
                        }
                      ]}
                    >
                      {item.name}
                    </Text>
                    {isSelected && (
                      <Ionicons 
                        name="checkmark" 
                        size={20} 
                        color={Colors[colorScheme ?? 'light'].primaryBlue} 
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[
                  styles.doneButton, 
                  { backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue }
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.doneButtonText}>Concluído</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Onest-Medium',
    fontSize: 16,
    marginBottom: 8,
  },
  selectButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    fontFamily: 'Onest-Regular',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Onest-Regular',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Onest-Medium',
  },
  chipRemove: {
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Onest-SemiBold',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Onest-Regular',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  doneButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Onest-SemiBold',
  },
});
