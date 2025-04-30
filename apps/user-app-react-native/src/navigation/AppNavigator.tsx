import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens as they are created
import MapScreen from '../features/map/MapScreen';
import ProviderDetailScreen from '../features/map/ProviderDetailScreen';

// Define the root stack parameter list
export type RootStackParamList = {
  Map: undefined;
  ProviderDetail: { providerId: string };
  // Add other screens here
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Map">
        <Stack.Screen 
          name="Map" 
          component={MapScreen} 
          options={{
            title: 'Find Providers',
            headerStyle: {
              backgroundColor: '#4285F4',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen 
          name="ProviderDetail" 
          component={ProviderDetailScreen} 
          options={{
            title: 'Provider Details',
            headerStyle: {
              backgroundColor: '#4285F4',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        {/* Add other screens here as they are created */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 