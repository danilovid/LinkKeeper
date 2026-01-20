import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ModernScreen from './src/screens/ModernScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#161b22', // GitHub dark header
            },
            headerTintColor: '#f0f6fc',
            headerTitleStyle: {
              fontWeight: '600',
            },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={ModernScreen}
            options={{ 
              title: 'LinkKeeper',
              headerShown: false, // Hide standard header, use custom one
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
