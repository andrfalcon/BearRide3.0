import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Clock, Users, MessageCircle } from 'lucide-react-native';

const JoinedGroupCard = ({
  groupName,
  memberCount,
  destination,
  departureTime,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.groupName}>{groupName}</Text>
          <TouchableOpacity 
            onPress={onPress}
            style={styles.chatButton}
          >
            <MessageCircle size={20} color="#3498db" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Users size={16} color="#2c3e50" />
            <Text style={styles.detailText}>{memberCount} Members</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MapPin size={16} color="#2c3e50" />
            <Text style={styles.detailText}>Destination: {destination}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Clock size={16} color="#2c3e50" />
            <Text style={styles.detailText}>Departure: {departureTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  chatButton: {
    padding: 8,
    marginLeft: 8,
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 15,
    color: '#34495e',
    marginLeft: 8,
  },
});

export default JoinedGroupCard; 