import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Option {
  id: string;
  name: string;
}

interface FormSelectProps {
  label: string;
  options: Option[];
  selectedOption?: Option;
  onSelect: (option: Option) => void;
  error?: string;
}

export function FormSelect({ 
  label, 
  options, 
  selectedOption, 
  onSelect, 
  error 
}: FormSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? 'light'].text;
  const borderColor = error 
    ? '#FF3B30' 
    : Colors[colorScheme ?? 'light'].primaryBlue + '40';
  const backgroundColor = Colors[colorScheme ?? 'light'].cardBackground;

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
              color: selectedOption ? textColor : textColor + '80'
            }
          ]}
        >
          {selectedOption ? selectedOption.name : 'Selecione uma opção'}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={Colors[colorScheme ?? 'light'].primaryBlue} 
        />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    selectedOption?.id === item.id && { 
                      backgroundColor: Colors[colorScheme ?? 'light'].primaryBlue + '20' 
                    }
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                  }}
                >
                  <Text 
                    style={[
                      styles.optionText, 
                      { color: textColor },
                      selectedOption?.id === item.id && { 
                        color: Colors[colorScheme ?? 'light'].primaryBlue,
                        fontFamily: 'Onest-SemiBold'
                      }
                    ]}
                  >
                    {item.name}
                  </Text>
                  {selectedOption?.id === item.id && (
                    <Ionicons 
                      name="checkmark" 
                      size={20} 
                      color={Colors[colorScheme ?? 'light'].primaryBlue} 
                    />
                  )}
                </TouchableOpacity>
              )}
            />
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
});
