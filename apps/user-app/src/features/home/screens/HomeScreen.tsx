import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const handleChatPress = () => {
    navigation.navigate('Chat');
  };

  const handleVoicePress = () => {
    // Placeholder for voice feature
    alert('Voice feature coming soon!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Provider Finder</Text>
        <Text style={styles.subtitle}>How can we help you today?</Text>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSearchPress}
            style={styles.button}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="magnify" size={size} color={color} />
            )}
          >
            Search Providers
          </Button>

          <Button
            mode="contained"
            onPress={handleChatPress}
            style={styles.button}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="chat" size={size} color={color} />
            )}
          >
            Chat Assistant
          </Button>

          <Button
            mode="contained"
            onPress={handleVoicePress}
            style={[styles.button, styles.comingSoon]}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="microphone" size={size} color={color} />
            )}
          >
            Voice Assistant
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#7f8c8d',
  },
  buttonContainer: {
    gap: 20,
  },
  button: {
    padding: 8,
    borderRadius: 12,
    elevation: 4,
  },
  comingSoon: {
    backgroundColor: '#95a5a6',
  },
});

export default HomeScreen; 