import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Provider } from '../types';
import { theme } from '../../../theme';

interface ProviderCardProps {
  provider: Provider;
  onPress?: () => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{provider.name}</Text>
          <Text style={styles.specialty}>{provider.specialty}</Text>
        </View>
        {provider.acceptingNewPatients && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Accepting Patients</Text>
          </View>
        )}
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location" size={16} color={theme.colors.secondary} />
        <Text style={styles.infoText}>{provider.address}</Text>
      </View>

      {provider.distance !== undefined && (
        <View style={styles.infoRow}>
          <Ionicons name="walk" size={16} color={theme.colors.secondary} />
          <Text style={styles.infoText}>{provider.distance.toFixed(1)} km away</Text>
        </View>
      )}

      <View style={styles.infoRow}>
        <Ionicons name="call" size={16} color={theme.colors.secondary} />
        <Text style={styles.infoText}>{provider.phoneNumber}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.rating}>
          <Ionicons name="star" size={16} color="#fbbf24" />
          <Text style={styles.ratingText}>{provider.rating.toFixed(1)}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => {/* Handle booking */}}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: theme.colors.secondary,
  },
  badge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 