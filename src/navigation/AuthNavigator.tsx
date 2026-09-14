import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginPhoneScreen } from '../screens/auth/LoginPhoneScreen';
import { VerifyOtpScreen } from '../screens/auth/VerifyOtpScreen';
import { RoleSelectScreen } from '../screens/auth/RoleSelectScreen';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="LoginPhone" component={LoginPhoneScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
    </Stack.Navigator>
  );
};
