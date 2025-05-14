import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
  onClose: () => void;
}

// Add static alert method to CustomAlert type
interface CustomAlertComponent extends React.FC<CustomAlertProps> {
  alert: (
    title: string, 
    message: string, 
    buttons?: { 
      text: string; 
      onPress?: () => void; 
      style?: 'default' | 'cancel' | 'destructive' 
    }[]
  ) => void;
}

// Global state for alert
let alertVisible = false;
let alertTitle = '';
let alertMessage = '';
let alertButtons: { text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }[] = [];
let setAlertState: React.Dispatch<React.SetStateAction<boolean>> | null = null;

const CustomAlertBase: React.FC<CustomAlertProps> = ({ visible, title, message, buttons, onClose }) => {
  const colorScheme = useColorScheme();
  const primaryColor = Colors[colorScheme ?? 'light'].primaryBlue;
  const backgroundColor = Colors[colorScheme ?? 'light'].cardBackground;
  const textColor = Colors[colorScheme ?? 'light'].text;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <ThemedView style={[styles.modalView, { backgroundColor }]}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.message}>{message}</ThemedText>
          
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => {
              let buttonStyle = {};
              let textStyle: { color: string; opacity?: number } = { color: primaryColor };
              
              if (button.style === 'destructive') {
                textStyle = { color: '#FF3B30' };
              } else if (button.style === 'cancel') {
                textStyle = { color: textColor, opacity: 0.7 };
              }
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.button, buttonStyle]}
                  onPress={() => {
                    button.onPress();
                    onClose();
                  }}
                >
                  <ThemedText style={[styles.buttonText, textStyle]}>
                    {button.text}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
};

// AlertProvider component to be used at the root of the app
export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  
  // Set the state setter for global access
  setAlertState = setVisible;
  
  const handleClose = () => {
    setVisible(false);
    alertVisible = false;
  };
  
  return (
    <>
      {children}
      <CustomAlert
        visible={visible}
        title={alertTitle}
        message={alertMessage}
        buttons={alertButtons}
        onClose={handleClose}
      />
    </>
  );
}

// Create the CustomAlert component with the static alert method
export const CustomAlert: CustomAlertComponent = Object.assign(
  CustomAlertBase,
  {
    alert: (
      title: string, 
      message: string, 
      buttons: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[] = [{ text: 'OK' }]
    ) => {
      alertTitle = title;
      alertMessage = message;
      alertButtons = buttons.map(button => ({
        ...button,
        onPress: button.onPress || (() => {})
      }));
      
      if (setAlertState) {
        setAlertState(true);
        alertVisible = true;
      } else {
        console.warn('AlertProvider not found in the component tree. Make sure to wrap your app with AlertProvider.');
      }
    }
  }
);

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: Platform.OS === 'web' ? 400 : '80%',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Onest-SemiBold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: 'Onest-Regular',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    padding: 12,
    minWidth: 80,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Onest-Medium',
  },
});
