import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ViewPreference } from '../types';
import { theme } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

interface ViewToggleProps {
  current: ViewPreference;
  onToggle: () => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ current, onToggle }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          current === 'LIST' && styles.activeButton,
        ]}
        onPress={() => current === 'MAP' && onToggle()}
      >
        <Ionicons
          name="list"
          size={24}
          color={current === 'LIST' ? theme.colors.primary : theme.colors.secondary}
        />
        <Text
          style={[
            styles.text,
            current === 'LIST' && styles.activeText,
          ]}
        >
          List
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          current === 'MAP' && styles.activeButton,
        ]}
        onPress={() => current === 'LIST' && onToggle()}
      >
        <Ionicons
          name="map"
          size={24}
          color={current === 'MAP' ? theme.colors.primary : theme.colors.secondary}
        />
        <Text
          style={[
            styles.text,
            current === 'MAP' && styles.activeText,
          ]}
        >
          Map
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    margin: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 8,
    borderRadius: theme.borderRadius.sm,
  },
  activeButton: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    color: theme.colors.secondary,
  },
  activeText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
}); 