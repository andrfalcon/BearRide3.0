import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import GroupCard from '../components/GroupCard';

export default function HomeScreen() {
  const [selectedOption, setSelectedOption] = useState('Option 1');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  const sampleGroups = [
    { 
      name: 'Julia\'s Group', 
      memberCount: 3,
      destination: 'UC Berkeley',
      departureTime: '8:00 AM',
      gradientColors: ['#E3F2FD', '#BBDEFB', '#90CAF9']
    },
    { 
      name: 'Chryssa\'s Group', 
      memberCount: 4,
      destination: 'SFO',
      departureTime: '5:30 PM',
      gradientColors: ['#F3E5F5', '#E1BEE7', '#CE93D8']
    },
    { 
      name: 'Andrew\'s Group', 
      memberCount: 5,
      destination: 'OAK',
      departureTime: '10:00 AM',
      gradientColors: ['#E8F5E9', '#C8E6C9', '#A5D6A7']
    },
  ];

  const onTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };

  const handleSubmit = () => {
    console.log('Selected Option:', selectedOption);
    console.log('Selected Time:', selectedTime);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Bearride</Text>
      
      <ScrollView style={styles.scrollView}>
        {sampleGroups.map((group, index) => (
          <GroupCard
            key={index}
            groupName={group.name}
            memberCount={group.memberCount}
            destination={group.destination}
            departureTime={group.departureTime}
            gradientColors={group.gradientColors}
            onPress={() => console.log(`Pressed ${group.name}`)}
          />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.createButton}>
        <Ionicons name="add-circle" size={24} color="#3498db" />
        <Text style={styles.createButtonText}>Create BearRide Group</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  scrollView: {
    width: '100%',
    flex: 1,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 30,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  createButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  createButtonText: {
    marginLeft: 8,
    color: '#3498db',
    fontSize: 16,
    fontWeight: '500',
  },
});
