import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Platform, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import GroupCard from '../components/GroupCard';
import CreateGroupModal from '../components/CreateGroupModal';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import GroupScreen from './GroupScreen';
import { getAuth } from 'firebase/auth';

const Tab = createBottomTabNavigator();

function HomeTab() {
  const navigation = useNavigation();
  const route = useRoute();
  const auth = getAuth();
  const [selectedOption, setSelectedOption] = useState('Option 1');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [joinedGroupIds, setJoinedGroupIds] = useState([]);

  useEffect(() => {
    fetchGroups();
    fetchJoinedGroups();
  }, []);

  const fetchJoinedGroups = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      if (userData && userData.joinedGroups) {
        setJoinedGroupIds(userData.joinedGroups);
      }
    } catch (err) {
      console.error('Error fetching joined groups:', err);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const groupsCollection = collection(db, 'groups');
      const q = query(groupsCollection, orderBy('departureTime', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedGroups = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().groupName,
        memberCount: doc.data().numMembers,
        destination: doc.data().destination,
        departureTime: doc.data().departureTime,
        gradientColors: getRandomGradientColors()
      }));
      
      setGroups(fetchedGroups);
      setError(null);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRandomGradientColors = () => {
    const gradients = [
      ['#E3F2FD', '#BBDEFB', '#90CAF9'],
      ['#F3E5F5', '#E1BEE7', '#CE93D8'],
      ['#E8F5E9', '#C8E6C9', '#A5D6A7'],
      ['#FFF3E0', '#FFE0B2', '#FFCC80'],
      ['#E0F7FA', '#B2EBF2', '#80DEEA']
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

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

  const handleCreateGroup = async (groupData) => {
    try {
      const groupsCollection = collection(db, 'groups');
      const newGroup = {
        groupName: groupData.groupName,
        destination: groupData.destination,
        departureTime: groupData.departureTime,
        numMembers: 1,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(groupsCollection, newGroup);
      console.log('Group created with ID:', docRef.id);
      
      // Refresh the groups list
      await fetchGroups();
      
      // Close the modal after successful creation
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group. Please try again.');
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchGroups().finally(() => setRefreshing(false));
  }, []);

  const joinGroup = async (groupId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to join a group');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        joinedGroups: arrayUnion(groupId)
      });

      // Update local state
      setJoinedGroupIds(prev => [...prev, groupId]);
      
      // Remove the joined group from the display
      setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));

      // Trigger refresh on GroupScreen
      navigation.navigate('Groups', { refresh: true });
    } catch (error) {
      console.error('Error joining group:', error);
      setError('Failed to join group. Please try again.');
    }
  };

  // Filter out joined groups
  const availableGroups = groups.filter(group => !joinedGroupIds.includes(group.id));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.heading}>Bearride</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : availableGroups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No groups available. Create one!</Text>
          </View>
        ) : (
          availableGroups.map((group, index) => (
            <GroupCard
              key={group.id}
              groupName={group.name}
              memberCount={group.memberCount}
              destination={group.destination}
              departureTime={group.departureTime}
              gradientColors={group.gradientColors}
              onPress={() => console.log(`Pressed ${group.name}`)}
              onJoinPress={() => joinGroup(group.id)}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add-circle" size={24} color="#3498db" />
        <Text style={styles.createButtonText}>Create BearRide Group</Text>
      </TouchableOpacity>

      <CreateGroupModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
        initialDestination={route.params?.destination || 'airport'}
        initialDepartureTime={route.params?.departureTime || '12:00 PM'}
      />

      <StatusBar style="auto" />
    </View>
  );
}

export default function HomeScreen() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Groups') {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeTab} />
      <Tab.Screen name="Groups" component={GroupScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    marginRight: 15,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  scrollView: {
    width: '100%',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    color: '#7f8c8d',
    fontSize: 16,
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
