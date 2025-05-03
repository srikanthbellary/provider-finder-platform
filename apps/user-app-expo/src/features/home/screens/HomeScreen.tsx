import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        icon="magnify"
        style={styles.button}
        onPress={() => navigation.navigate('Search')}
      >
        Search Providers
      </Button>

      <Button
        mode="contained"
        icon="chat"
        style={styles.button}
        onPress={() => navigation.navigate('Chat')}
      >
        Chat Assistant
      </Button>

      <Button
        mode="contained"
        icon="microphone"
        style={styles.button}
        disabled={true}
      >
        Voice Assistant
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  button: {
    marginVertical: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
});

export default HomeScreen; 