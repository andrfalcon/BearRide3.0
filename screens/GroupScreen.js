import { StyleSheet, Text, View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import JoinedGroupCard from '../components/JoinedGroupCard';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function GroupScreen() {
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    fetchJoinedGroups();
  }, []);

  // Add effect to handle refresh parameter
  useEffect(() => {
    if (route.params?.refresh) {
      fetchJoinedGroups();
      // Clear the refresh parameter
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchJoinedGroups().finally(() => setRefreshing(false));
  }, []);

  const fetchJoinedGroups = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError('Please sign in to view your groups');
        return;
      }

      // Get user document to access joinedGroups array
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (!userData || !userData.joinedGroups || userData.joinedGroups.length === 0) {
        setJoinedGroups([]);
        return;
      }

      // Fetch details for each joined group
      const groupsCollection = collection(db, 'groups');
      const groupsPromises = userData.joinedGroups.map(async (groupId) => {
        const groupDoc = await getDoc(doc(groupsCollection, groupId));
        if (groupDoc.exists()) {
          const groupData = groupDoc.data();
          return {
            id: groupDoc.id,
            name: groupData.groupName,
            memberCount: groupData.numMembers,
            destination: groupData.destination,
            departureTime: groupData.departureTime,
          };
        }
        return null;
      });

      const groups = (await Promise.all(groupsPromises)).filter(group => group !== null);
      setJoinedGroups(groups);
      setError(null);
    } catch (err) {
      console.error('Error fetching joined groups:', err);
      setError('Failed to load your groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>My Groups</Text>
      </View>
      <StatusBar style="auto" />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
          />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3498db" />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : joinedGroups.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>You have not joined any BearRide groups yet</Text>
          </View>
        ) : (
          joinedGroups.map((group) => (
            <JoinedGroupCard
              key={group.id}
              groupName={group.name}
              memberCount={group.memberCount}
              destination={group.destination}
              departureTime={group.departureTime}
              onPress={() => navigation.navigate('Messaging', { groupId: group.id, groupName: group.name })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
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
  emptyText: {
    color: '#7f8c8d',
    fontSize: 16,
    textAlign: 'center',
  },
}); 