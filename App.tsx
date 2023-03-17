import React from 'react';
import AppPage from './components/AppPage';
import { StyleSheet } from 'react-native';
import SplashScreen from './components/SplashScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
// This is the main component of the app.
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator >
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AppPage" component={AppPage} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// this is the style of our page
const styles = StyleSheet.create({});
