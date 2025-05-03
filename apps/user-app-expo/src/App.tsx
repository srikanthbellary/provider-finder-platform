import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { theme } from './theme';

// Screens
import HomeScreen from './features/home/screens/HomeScreen';
import ChatScreen from './features/chat/screens/ChatScreen';
import SearchScreen from './features/search/screens/SearchScreen';
import MapScreen from './features/map/screens/MapScreen';

export type RootStackParamList = {
  Home: undefined;
  Chat: undefined;
  Search: undefined;
  Map: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2c3e50',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              title: 'Provider Finder',
            }}
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{
              title: 'Health Assistant',
            }}
          />
          <Stack.Screen 
            name="Search" 
            component={SearchScreen}
            options={{
              title: 'Find Provider',
            }}
          />
          <Stack.Screen 
            name="Map" 
            component={MapScreen}
            options={{
              title: 'Provider Map',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App; 