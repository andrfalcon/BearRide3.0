// TravelPlanner.js
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { MapPin, Clock } from 'lucide-react-native'

export default function TravelPlanner({ navigation }) {
  const [destination, setDestination] = useState('airport')
  const [departureTime, setDepartureTime] = useState('')
  const [timeOptions, setTimeOptions] = useState([])

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
      setDepartureTime(opts[0])
    }
    generateTimeOptions()
  }, [])

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* DESTINATION */}
      <View style={{ width: '100%', alignItems: 'flex-start' }}>
        <View style={styles.row}>
          <MapPin size={20} color="#008080" />
          <Text style={styles.heading}>Where are you going?</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>
            {destination === 'airport' ? 'Airport' : 'Berkeley'}
          </Text>
          <Text style={styles.subtext}>
            {destination === 'airport'
              ? 'Travel to the airport'
              : 'Travel to Berkeley'}
          </Text>
        </View>
        <View style={styles.switchRow}>
          <Text
            style={
              destination === 'airport'
                ? styles.activeLabel
                : styles.inactiveLabel
            }
          >
            Airport
          </Text>
          <Switch
            value={destination === 'berkeley'}
            onValueChange={(c) => setDestination(c ? 'berkeley' : 'airport')}
          />
          <Text
            style={
              destination === 'berkeley'
                ? styles.activeLabel
                : styles.inactiveLabel
            }
          >
            Berkeley
          </Text>
        </View>
      </View>

      {/* TIME PICKER */}
      <View style={{ width: '100%', alignItems: 'flex-start' }}>
        <View style={styles.row}>
          <Clock size={20} color="#008080" />
          <Text style={styles.heading}>What time are you leaving?</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Picker
          selectedValue={departureTime}
          onValueChange={(val) => setDepartureTime(val)}
          style={styles.picker}
          itemStyle={{ fontSize: 16 }}
        >
          {timeOptions.map((t) => (
            <Picker.Item key={t} label={t} value={t} />
          ))}
        </Picker>
      </View>

      {/* SUMMARY */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          You're going to{' '}
          <Text style={styles.boldText}>
            {destination === 'berkeley' ? 'Berkeley' : 'the airport'}
          </Text>{' '}
          at <Text style={styles.boldText}>{departureTime}</Text>
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.rideButton}
        onPress={() => {
          navigation.navigate('Home', {
            destination: destination,
            departureTime: departureTime
          });
        }}
      >
        <Text style={styles.rideButtonText}>See Available BearRides</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                    // fill screen
    justifyContent: 'center',   // vertical center
    alignItems: 'center',       // horizontal center
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  heading: {
    fontSize: 25,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  card: {
    width: '100%',              // full-width card
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00808020',
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',   // center children horizontally
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  subtext: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  activeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 6,
  },
  inactiveLabel: {
    fontSize: 13,
    color: '#aaa',
    marginHorizontal: 6,
  },
  picker: {
    width: '100%',              // make the dropdown fill the card
    height: Platform.OS === 'android' ? 50 : undefined,
  },
  summaryBox: {
    backgroundColor: '#00808020',
    borderColor: '#00808040',
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    width: '100%',
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
  },
  boldText: {
    fontWeight: '600',
  },
  rideButton: {
    backgroundColor: '#008080',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  rideButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
})

// import { StyleSheet, Text, View, TouchableOpacity, Image, Platform } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import { LinearGradient } from 'expo-linear-gradient';

// export default function WelcomeScreen({ navigation }) {
//   return (
//     <View style={styles.container}>
//       <LinearGradient
//         colors={['#3498db', '#2980b9']}
//         style={styles.gradient}
//       >
//         <View style={styles.content}>
//           <Text style={styles.title}>Welcome to BearRide</Text>
//           <Text style={styles.subtitle}>Your campus ride-sharing solution</Text>
          
//           <View style={styles.buttonContainer}>
//             <TouchableOpacity 
//               style={styles.button}
//               onPress={() => navigation.navigate('Home')}
//             >
//               <Text style={styles.buttonText}>Get Started</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </LinearGradient>
//       <StatusBar style="light" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   gradient: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   content: {
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 36,
//     fontWeight: 'bold',
//     color: 'white',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 18,
//     color: 'white',
//     marginBottom: 40,
//     textAlign: 'center',
//     opacity: 0.9,
//   },
//   buttonContainer: {
//     width: '100%',
//     paddingHorizontal: 20,
//   },
//   button: {
//     backgroundColor: 'white',
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//     borderRadius: 25,
//     alignItems: 'center',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//       },
//       android: {
//         elevation: 5,
//       },
//     }),
//   },
//   buttonText: {
//     color: '#3498db',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });
