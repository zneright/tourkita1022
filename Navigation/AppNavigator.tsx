import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import TermsScreen from '../screens/TermsScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import MapsScreen from '../screens/MapScreen';
import SupportScreen from '../screens/SupportScreen';
import SearchScreen from '../screens/SearchScreen';
import ArCamScreen from '../screens/ArCamScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LandmarkProvider from '../provider/LandmarkProvider';
import SelectedLandmarkSheet from '../components/selectedLandmarkSheet';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <GestureHandlerRootView>
            <LandmarkProvider>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
            <Stack.Screen name="Maps" component={MapsScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="ArCam" component={ArCamScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
        <SelectedLandmarkSheet/>
            </LandmarkProvider>
        </GestureHandlerRootView>
    );
};

export default AppNavigator;
