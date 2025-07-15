import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  category: string;
  enabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState<NotificationSetting[]>([
    // Activity Notifications
    {
      id: 'activity_joined',
      title: 'Someone joins your activity',
      description: 'Get notified when someone joins an activity you created',
      category: 'Activities',
      enabled: true,
      pushEnabled: true,
      emailEnabled: false,
    },
    {
      id: 'activity_cancelled',
      title: 'Activity cancelled',
      description: 'Get notified when an activity you joined is cancelled',
      category: 'Activities',
      enabled: true,
      pushEnabled: true,
      emailEnabled: true,
    },
    {
      id: 'activity_reminder',
      title: 'Activity reminders',
      description: 'Get reminded about upcoming activities',
      category: 'Activities',
      enabled: true,
      pushEnabled: true,
      emailEnabled: false,
    },
    {
      id: 'activity_nearby',
      title: 'Nearby activities',
      description: 'Get notified about new activities near you',
      category: 'Activities',
      enabled: false,
      pushEnabled: false,
      emailEnabled: false,
    },
    
    // Message Notifications
    {
      id: 'new_message',
      title: 'New messages',
      description: 'Get notified when you receive new messages',
      category: 'Messages',
      enabled: true,
      pushEnabled: true,
      emailEnabled: false,
    },
    {
      id: 'group_message',
      title: 'Group messages',
      description: 'Get notified about messages in group chats',
      category: 'Messages',
      enabled: true,
      pushEnabled: true,
      emailEnabled: false,
    },
    
    // Booking Notifications
    {
      id: 'booking_request',
      title: 'New booking requests',
      description: 'Get notified when someone books your service',
      category: 'Bookings',
      enabled: true,
      pushEnabled: true,
      emailEnabled: true,
    },
    {
      id: 'booking_accepted',
      title: 'Booking accepted',
      description: 'Get notified when your booking is accepted',
      category: 'Bookings',
      enabled: true,
      pushEnabled: true,
      emailEnabled: false,
    },
    {
      id: 'booking_completed',
      title: 'Booking completed',
      description: 'Get notified when a booking is marked as completed',
      category: 'Bookings',
      enabled: true,
      pushEnabled: true,
      emailEnabled: false,
    },
    
    // Social Notifications
    {
      id: 'new_follower',
      title: 'New followers',
      description: 'Get notified when someone follows you',
      category: 'Social',
      enabled: true,
      pushEnabled: true,
      emailEnabled: false,
    },
    {
      id: 'friend_activity',
      title: 'Friend activities',
      description: 'Get notified about activities from people you follow',
      category: 'Social',
      enabled: false,
      pushEnabled: false,
      emailEnabled: false,
    },
    
    // System Notifications
    {
      id: 'security_alerts',
      title: 'Security alerts',
      description: 'Get notified about important security updates',
      category: 'System',
      enabled: true,
      pushEnabled: true,
      emailEnabled: true,
    },
    {
      id: 'app_updates',
      title: 'App updates',
      description: 'Get notified about new app features and updates',
      category: 'System',
      enabled: false,
      pushEnabled: false,
      emailEnabled: false,
    },
  ]);

  const [masterPushEnabled, setMasterPushEnabled] = useState(true);
  const [masterEmailEnabled, setMasterEmailEnabled] = useState(true);
  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start: '22:00',
    end: '08:00',
  });

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      setMasterPushEnabled(false);
    }
  };

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setMasterPushEnabled(true);
      Alert.alert('Success', 'Notification permissions granted');
    } else {
      Alert.alert('Permission Denied', 'Please enable notifications in your device settings');
    }
  };

  const updateSetting = (id: string, field: 'enabled' | 'pushEnabled' | 'emailEnabled', value: boolean) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id 
        ? { ...setting, [field]: value }
        : setting
    ));
  };

  const toggleMasterPush = async (value: boolean) => {
    if (value) {
      await requestNotificationPermissions();
    } else {
      setMasterPushEnabled(false);
      // Disable all push notifications
      setSettings(prev => prev.map(setting => ({ ...setting, pushEnabled: false })));
    }
  };

  const toggleMasterEmail = (value: boolean) => {
    setMasterEmailEnabled(value);
    if (!value) {
      // Disable all email notifications
      setSettings(prev => prev.map(setting => ({ ...setting, emailEnabled: false })));
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, NotificationSetting[]>);

  const renderSettingItem = (setting: NotificationSetting) => (
    <View key={setting.id} style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{setting.title}</Text>
        <Text style={styles.settingDescription}>{setting.description}</Text>
        
        <View style={styles.settingToggles}>
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>Push</Text>
            <Switch
              value={setting.pushEnabled && masterPushEnabled}
              onValueChange={(value) => updateSetting(setting.id, 'pushEnabled', value)}
              disabled={!masterPushEnabled}
              trackColor={{ false: '#d1d5db', true: '#22c55e' }}
              thumbColor={setting.pushEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.toggleItem}>
            <Text style={styles.toggleLabel}>Email</Text>
            <Switch
              value={setting.emailEnabled && masterEmailEnabled}
              onValueChange={(value) => updateSetting(setting.id, 'emailEnabled', value)}
              disabled={!masterEmailEnabled}
              trackColor={{ false: '#d1d5db', true: '#22c55e' }}
              thumbColor={setting.emailEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <TouchableOpacity>
          <Ionicons name="checkmark" size={24} color="#22c55e" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Master Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Master Controls</Text>
          
          <View style={styles.masterControl}>
            <View style={styles.masterControlInfo}>
              <Text style={styles.masterControlTitle}>Push Notifications</Text>
              <Text style={styles.masterControlDescription}>
                Enable or disable all push notifications
              </Text>
            </View>
            <Switch
              value={masterPushEnabled}
              onValueChange={toggleMasterPush}
              trackColor={{ false: '#d1d5db', true: '#22c55e' }}
              thumbColor={masterPushEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.masterControl}>
            <View style={styles.masterControlInfo}>
              <Text style={styles.masterControlTitle}>Email Notifications</Text>
              <Text style={styles.masterControlDescription}>
                Enable or disable all email notifications
              </Text>
            </View>
            <Switch
              value={masterEmailEnabled}
              onValueChange={toggleMasterEmail}
              trackColor={{ false: '#d1d5db', true: '#22c55e' }}
              thumbColor={masterEmailEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          
          <TouchableOpacity style={styles.quietHoursControl}>
            <View style={styles.quietHoursInfo}>
              <Text style={styles.quietHoursTitle}>Do Not Disturb</Text>
              <Text style={styles.quietHoursDescription}>
                {quietHours.enabled 
                  ? `Quiet from ${quietHours.start} to ${quietHours.end}`
                  : 'Receive notifications at any time'
                }
              </Text>
            </View>
            <Switch
              value={quietHours.enabled}
              onValueChange={(value) => setQuietHours(prev => ({ ...prev, enabled: value }))}
              trackColor={{ false: '#d1d5db', true: '#22c55e' }}
              thumbColor={quietHours.enabled ? '#ffffff' : '#f4f3f4'}
            />
          </TouchableOpacity>
        </View>

        {/* Notification Categories */}
        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{category}</Text>
            {categorySettings.map(renderSettingItem)}
          </View>
        ))}

        {/* Additional Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Options</Text>
          
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="volume-high" size={20} color="#6b7280" />
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Notification Sound</Text>
              <Text style={styles.optionDescription}>Default</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="phone-portrait" size={20} color="#6b7280" />
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Vibration</Text>
              <Text style={styles.optionDescription}>Enabled</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <Ionicons name="notifications" size={20} color="#6b7280" />
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Badge Count</Text>
              <Text style={styles.optionDescription}>Show unread count</Text>
            </View>
            <Switch
              value={true}
              trackColor={{ false: '#d1d5db', true: '#22c55e' }}
              thumbColor={'#ffffff'}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  masterControl: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  masterControlInfo: {
    flex: 1,
  },
  masterControlTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  masterControlDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  quietHoursControl: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  quietHoursInfo: {
    flex: 1,
  },
  quietHoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  quietHoursDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  settingItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  settingToggles: {
    flexDirection: 'row',
    gap: 30,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 15,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
});
