import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens as they are created
import MapScreen from '../features/map/MapScreen';

export type RootStackParamList = {
  Map: undefined;
  ProviderDetail: { providerId: string };
  // Add other screens here
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Map">
      <Stack.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ 
          title: 'Provider Finder',
          headerStyle: {
            backgroundColor: '#4285F4',
          },
          headerTintColor: '#fff',
        }}
      />
      {/* Add other screens here as they are created */}
    </Stack.Navigator>
  );
};

export default AppNavigator; 