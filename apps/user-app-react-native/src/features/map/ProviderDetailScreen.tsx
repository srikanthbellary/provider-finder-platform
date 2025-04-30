import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Image,
  Linking,
  Platform,
  Alert
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { fetchProviderById } from '../map/mapSlice';

type ProviderDetailRouteProp = RouteProp<RootStackParamList, 'ProviderDetail'>;
type ProviderDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ProviderDetail'>;

const ProviderDetailScreen: React.FC = () => {
  const route = useRoute<ProviderDetailRouteProp>();
  const navigation = useNavigation<ProviderDetailNavigationProp>();
  const dispatch = useAppDispatch();
  
  const { providerId } = route.params;
  
  // Get provider from store
  const { selectedProvider, loading, error } = useAppSelector((state) => state.map);
  
  // Fetch provider details when component mounts
  useEffect(() => {
    if (providerId) {
      dispatch(fetchProviderById(parseInt(providerId)));
    }
  }, [dispatch, providerId]);
  
  // Handle calling the provider
  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };
  
  // Handle getting directions
  const handleGetDirections = (lat: number, lng: number) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const label = selectedProvider?.name || 'Provider Location';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    
    if (url) {
      Linking.openURL(url);
    }
  };
  
  // Handle booking appointment (placeholder for now)
  const handleBookAppointment = () => {
    // Will be implemented later
    Alert.alert('Coming Soon', 'Appointment booking will be available soon!');
  };
  
  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Loading provider details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Render error state
  if (error || !selectedProvider) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || 'Provider not found'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => dispatch(fetchProviderById(parseInt(providerId)))}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Get primary location or first location
  const location = selectedProvider.locations.find(loc => loc.isPrimary) || 
                   selectedProvider.locations[0];
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Provider Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {selectedProvider.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.providerName}>{selectedProvider.name}</Text>
            <Text style={styles.providerType}>{selectedProvider.providerType || 'Healthcare Provider'}</Text>
            {selectedProvider.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Contact & Location Info */}
        {location && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.address}>
              {location.addressLine1}
              {location.addressLine2 ? `\n${location.addressLine2}` : ''}
              {`\n${location.city}, ${location.state} ${location.postalCode}`}
            </Text>
            
            <View style={styles.actionButtons}>
              {location.phone && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleCall(location.phone || '')}
                >
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleGetDirections(location.latitude, location.longitude)}
              >
                <Text style={styles.actionButtonText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Specialties */}
        {selectedProvider.specialties && selectedProvider.specialties.length > 0 && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.specialtiesContainer}>
              {selectedProvider.specialties.map((specialty, index) => (
                <View key={index} style={styles.specialtyChip}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Languages */}
        {selectedProvider.languages && selectedProvider.languages.length > 0 && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <Text style={styles.languagesText}>
              {selectedProvider.languages.join(', ')}
            </Text>
          </View>
        )}
        
        {/* About */}
        {selectedProvider.description && (
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.descriptionText}>{selectedProvider.description}</Text>
          </View>
        )}
      </ScrollView>
      
      {/* Book Appointment Button */}
      <View style={styles.bookingContainer}>
        <TouchableOpacity 
          style={styles.bookingButton}
          onPress={handleBookAppointment}
        >
          <Text style={styles.bookingButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  providerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  providerType: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    marginHorizontal: 4,
    flex: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#4285F4',
    fontWeight: 'bold',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyChip: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  specialtyText: {
    color: '#1976D2',
    fontSize: 14,
  },
  languagesText: {
    fontSize: 16,
    color: '#666666',
  },
  descriptionText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  bookingContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: 'white',
  },
  bookingButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProviderDetailScreen; 