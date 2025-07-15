import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { Session } from '@supabase/supabase-js';

import { supabase } from './lib/supabase';
import LoadingScreen from './components/LoadingScreen';

// Core Pages
import AuthScreen from './screens/AuthScreen';
import IndexScreen from './screens/IndexScreen';
import HomeScreen from './screens/HomeScreen';

// Location & Activities
import MapScreen from './screens/MapScreen';
import MeetUpScreen from './screens/MeetUpScreen';
import ActivityScreen from './screens/ActivityScreen';
import ActivityDetailScreen from './screens/ActivityDetailScreen';

// Services & Marketplace
import HireScreen from './screens/HireScreen';
import GigsScreen from './screens/GigsScreen';
import GigDetailScreen from './screens/GigDetailScreen';
import ProviderDashboardScreen from './screens/ProviderDashboardScreen';
import BookingsScreen from './screens/BookingsScreen';

// Communication
import ChatScreen from './screens/ChatScreen';
import SimpleChatScreen from './screens/SimpleChatScreen';
import ChatTestScreen from './screens/ChatTestScreen';

// User Management
import ProfileScreen from './screens/ProfileScreen';
import NetworkScreen from './screens/NetworkScreen';

// Settings & Configuration
import SettingsScreen from './screens/SettingsScreen';
import NotificationSettingsScreen from './screens/NotificationSettingsScreen';
import NotificationsScreen from './screens/NotificationsScreen';

// Financial
import WalletScreen from './screens/WalletScreen';
import SubscriptionScreen from './screens/SubscriptionScreen';
import EarnScreen from './screens/EarnScreen';

// Administrative
import AdminScreen from './screens/AdminScreen';
import HelpScreen from './screens/HelpScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const linking = {
  prefixes: [Linking.createURL('/'), 'buddysurf://'],
  config: {
    screens: {
      Index: '',
      Main: {
        screens: {
          HomeTab: {
            screens: {
              Home: 'home',
              Profile: 'profile/:userId?',
              Settings: 'settings',
              NotificationSettings: 'notification-settings',
              Notifications: 'notifications',
              Wallet: 'wallet',
              Subscription: 'subscription',
              Earn: 'earn',
              Network: 'network',
              Help: 'help',
              Admin: 'admin',
            },
          },
          MapTab: {
            screens: {
              Map: 'map',
            },
          },
          ActivityTab: {
            screens: {
              Activity: 'activity',
              ActivityDetail: 'activity/:id',
              MeetUp: 'meetup',
            },
          },
          HireTab: {
            screens: {
              Hire: 'hire',
              Gigs: 'gigs',
              GigDetail: 'gig/:id',
              ProviderDashboard: 'provider-dashboard',
              Bookings: 'bookings',
            },
          },
          ChatTab: {
            screens: {
              Chat: 'chat/:conversationId?',
              SimpleChat: 'simple-chat',
              ChatTest: 'chat-test',
            },
          },
        },
      },
      Auth: 'auth',
    },
  },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MapTab') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'ActivityTab') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'HireTab') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapStackNavigator}
        options={{ title: 'Map' }}
      />
      <Tab.Screen
        name="ActivityTab"
        component={ActivityStackNavigator}
        options={{ title: 'Activities' }}
      />
      <Tab.Screen
        name="HireTab"
        component={HireStackNavigator}
        options={{ title: 'Hire' }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStackNavigator}
        options={{ title: 'Chat' }}
      />
    </Tab.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Earn" component={EarnScreen} />
      <Stack.Screen name="Network" component={NetworkScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
    </Stack.Navigator>
  );
}

function MapStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Map" component={MapScreen} />
    </Stack.Navigator>
  );
}

function ActivityStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Activity" component={ActivityScreen} />
      <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
      <Stack.Screen name="MeetUp" component={MeetUpScreen} />
    </Stack.Navigator>
  );
}

function HireStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Hire" component={HireScreen} />
      <Stack.Screen name="Gigs" component={GigsScreen} />
      <Stack.Screen name="GigDetail" component={GigDetailScreen} />
      <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} />
      <Stack.Screen name="Bookings" component={BookingsScreen} />
    </Stack.Navigator>
  );
}

function ChatStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="SimpleChat" component={SimpleChatScreen} />
      <Stack.Screen name="ChatTest" component={ChatTestScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer linking={linking}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session ? (
            <Stack.Screen name="Main" component={TabNavigator} />
          ) : (
            <>
              <Stack.Screen name="Index" component={IndexScreen} />
              <Stack.Screen name="Auth" component={AuthScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
