import React from 'react';
import { StyleSheet, TextInput, View, Text, TextInputProps } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

export function FormInput({ label, error, rightIcon, ...props }: FormInputProps) {
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme ?? 'light'].text;
  const borderColor = error 
    ? '#FF3B30' 
    : Colors[colorScheme ?? 'light'].primaryBlue + '40';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <View style={[
        styles.inputContainer,
        { 
          borderColor: borderColor,
          backgroundColor: Colors[colorScheme ?? 'light'].cardBackground
        }
      ]}>
        <TextInput
          style={[
            styles.input,
            { 
              color: textColor,
            }
          ]}
          placeholderTextColor={textColor + '80'}
          {...props}
        />
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Onest-Regular',
  },
  rightIconContainer: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Onest-Regular',
  },
});
