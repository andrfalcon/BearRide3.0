import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function GroupScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Groups</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 30,
  },
}); 