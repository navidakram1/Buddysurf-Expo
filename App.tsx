import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import all screens
import LandingScreen from './screens/LandingScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import AuthScreen from './screens/AuthScreen';
import ActivityScreen from './screens/ActivityScreen';
import ActivityDetailScreen from './screens/ActivityDetailScreen';
import AdminScreen from './screens/AdminScreen';
import BookingsScreen from './screens/BookingsScreen';
import ChatScreen from './screens/ChatScreen';
import ChatTestScreen from './screens/ChatTestScreen';
import EarnScreen from './screens/EarnScreen';
import GigDetailScreen from './screens/GigDetailScreen';
import GigsScreen from './screens/GigsScreen';
import HelpScreen from './screens/HelpScreen';
import HireScreen from './screens/HireScreen';
import IndexScreen from './screens/IndexScreen';
import MapScreen from './screens/MapScreen';
import MeetUpScreen from './screens/MeetUpScreen';
import NetworkScreen from './screens/NetworkScreen';
import NotificationSettingsScreen from './screens/NotificationSettingsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProviderDashboardScreen from './screens/ProviderDashboardScreen';
import SimpleChatScreen from './screens/SimpleChatScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import WalletScreen from './screens/WalletScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Activity" component={ActivityScreen} />
        <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="Bookings" component={BookingsScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="ChatTest" component={ChatTestScreen} />
        <Stack.Screen name="Earn" component={EarnScreen} />
        <Stack.Screen name="GigDetail" component={GigDetailScreen} />
        <Stack.Screen name="Gigs" component={GigsScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="Hire" component={HireScreen} />
        <Stack.Screen name="Index" component={IndexScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="MeetUp" component={MeetUpScreen} />
        <Stack.Screen name="Network" component={NetworkScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} />
        <Stack.Screen name="SimpleChat" component={SimpleChatScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
