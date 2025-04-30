import React from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './store/store';
import AppNavigator from './navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#4285F4" />
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App; 