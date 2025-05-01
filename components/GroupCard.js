import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, MapPin, Users } from 'lucide-react-native';

// Note: In a real project, you would import icons like this:
// import { Clock, MapPin, Users } from 'lucide-react-native';
// For this example, I'll create placeholder components

const IconPlaceholder = ({ name, size = 16, color = '#fff' }) => (
  <View style={[styles.icon, { width: size, height: size, backgroundColor: color }]} />
);

const GroupCard = ({
  groupName = "Ride Group",
  memberCount = 2,
  destination = "SFO",
  departureTime = "5:00PM",
  onPress,
  onJoinPress,
  gradientColors = ['#B2D8D8', '#33CCCC'], // Default from your palette
}) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.groupName}>{groupName}</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Users size={16} color="#ffffff90" />
            <Text style={styles.detailText}>{memberCount} Members</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MapPin size={16} color="#ffffff90" />
            <Text style={styles.detailText}>Destination: {destination}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Clock size={16} color="#ffffff90" />
            <Text style={styles.detailText}>Departure Time: {departureTime}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.joinButton}
          onPress={onJoinPress}
          activeOpacity={0.8}
        >
          <Text style={styles.joinButtonText}>Join Group</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 16,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Shadow for Android
    elevation: 6,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  groupName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  detailsContainer: {
    padding: 16,
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
    opacity: 0.8,
  },
  detailText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    opacity: 0.95,
    marginLeft: 8,
  },
  joinButton: {
    backgroundColor: '#ffffff20',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff40',
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupCard;