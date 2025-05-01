import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Platform, ScrollView, ActivityIndicator, RefreshControl, Image, Picker } from 'react-native';
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
import { Users, Plus, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [timeOptions, setTimeOptions] = useState([]);
  const [departureTime, setDepartureTime] = useState('');

  const { realDestination, realDepartureTime } = route.params;

  const gradientOptions = [
    ['#B2D8D8', '#33CCCC'], // 💧 → 🌊
    ['#33CCCC', '#006666'], // 🌊 → 🌑
    ['#006666', '#B2D8D8'], // 🌑 → 💧
    ['#33CCCC', '#B2D8D8'], // 🌊 → 💧
  ];

  useEffect(() => {
    console.log('HomeScreen route params:', route.params);
    fetchGroups();
    fetchJoinedGroups();
  }, []);

  useEffect(() => {
    console.log('HomeScreen - Received route params:', route.params);
    if (route.params?.departureTime) {
      console.log('Setting departure time from route params:', route.params.departureTime);
      setDepartureTime(route.params.departureTime);
    }
  }, [route.params]);

  useEffect(() => {
    const generateTimeOptions = () => {
      const now = new Date()
      const opts = []
      const mins = now.getMinutes()
      const rounded = Math.ceil(mins / 15) * 15

      // handle overflow past 60
      if (rounded === 60) {
        now.setHours(now.getHours() + 1)
        now.setMinutes(0)
      } else {
        now.setMinutes(rounded)
      }
      now.setSeconds(0)

      for (let i = 0; i < 13; i++) {
        opts.push(
          now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        )
        now.setMinutes(now.getMinutes() + 15)
      }

      setTimeOptions(opts)
      // Only set departure time if not provided in route params
      if (!route.params?.departureTime) {
        console.log('Setting default departure time:', opts[0]);
        setDepartureTime(opts[0])
      }
    }
    generateTimeOptions()
  }, [route.params?.departureTime])

  useEffect(() => {
    console.log('HomeScreen - Route params:', route.params);
    console.log('HomeScreen - Current departureTime state:', departureTime);
  }, [route.params, departureTime]);

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
        <View style={styles.row}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={22} color="#008080" />
          </TouchableOpacity>
          <Text style={styles.heading}>BearRide</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <RefreshCw size={18} color="#008080" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Available Rides</Text>
            <Text style={styles.cardSubtitle}>{groups.length} groups found</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#008080"]} tintColor="#008080" />
            }
          >
            {loading ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color="#008080" />
                <Text style={styles.loadingText}>Finding rides...</Text>
              </View>
            ) : error ? (
              <View style={styles.centerContent}>
                <Ionicons name="alert-circle-outline" size={40} color="#e74c3c" style={styles.errorIcon} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : groups.length === 0 ? (
              <View style={styles.centerContent}>
                <Image
                  source={{ uri: "https://cdn-icons-png.flaticon.com/512/6598/6598519.png" }}
                  style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>No rides available</Text>
                <Text style={styles.emptyText}>Be the first to create a ride group!</Text>
              </View>
            ) : (
              groups.map((group) => (
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
        </View>
      </View>

      <TouchableOpacity
        style={styles.createButtonContainer}
        activeOpacity={0.9}
        onPress={() => setShowCreateModal(true)}
      >
        <LinearGradient
          colors={["#009688", "#00796B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createButton}
        >
          <Plus size={18} color="white" />
          <Text style={styles.createButtonText}>Create BearRide Group</Text>
        </LinearGradient>
      </TouchableOpacity>

      <CreateGroupModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroup}
        initialDestination={realDestination}
        initialDepartureTime={realDepartureTime}
      />

      <StatusBar style="auto" />
    </View>
  );
}

export default function HomeScreen() {
  const route = useRoute();
  const initialParams = route.params || {};

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Home") {
            return focused ? (
              <Ionicons name="home" size={size} color={color} />
            ) : (
              <Ionicons name="home-outline" size={size} color={color} />
            )
          } else if (route.name === "Groups") {
            return <Users size={size} color={color} />
          }
        },
        tabBarActiveTintColor: "#008080",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarStyle: {
          elevation: 0,
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 16,
          paddingTop: 8,
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontWeight: "500",
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeTab}
        initialParams={initialParams}
      />
      <Tab.Screen name="Groups" component={GroupScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 128, 128, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 128, 128, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    letterSpacing: -0.5,
  },
  cardContainer: {
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 2,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 128, 128, 0.08)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  centerContent: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#e74c3c",
    fontWeight: "500",
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    maxWidth: "80%",
  },
  createButtonContainer: {
    shadowColor: "#008080",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
  },
  createButtonText: {
    marginLeft: 8,
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  picker: {
    width: '100%',
    height: 50,
    marginBottom: 16,
  },
});
