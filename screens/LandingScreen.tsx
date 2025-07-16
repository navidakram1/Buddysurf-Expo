import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LandingScreen() {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('Home'); // Assumes 'Home' is the route name for HomeScreen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌊 BuddySurf</Text>
      <Text style={styles.title}>Welcome to BuddySurf!</Text>
      <Text style={styles.subtitle}>Find, connect, and surf with buddies around the world.</Text>
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 24,
  },
  logo: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0077b6',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 