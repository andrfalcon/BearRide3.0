import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, MapPin, Clock, Edit } from 'lucide-react-native';

export default function CreateGroupModal({ visible, onClose, onSubmit, initialDestination, initialDepartureTime }) {
  const [groupName, setGroupName] = useState('');
  const [animation] = useState(new Animated.Value(0));

  // Add logging for props
  React.useEffect(() => {
    console.log('CreateGroupModal - Received props:', {
      visible,
      initialDestination,
      initialDepartureTime
    });
  }, [visible, initialDestination, initialDepartureTime]);

  // Animation effect when modal opens
  React.useEffect(() => {
    if (visible) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animation]);

  const handleSubmit = () => {
    onSubmit({
      groupName,
      destination: initialDestination,
      departureTime: initialDepartureTime,
    });
    // Reset form
    setGroupName('');
    onClose();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const modalScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const modalOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                opacity: modalOpacity,
                transform: [{ scale: modalScale }]
              }
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.modalTitle}>Create BearRide Group</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Edit size={18} color="#008080" />
                  <Text style={styles.inputLabel}>Group Name</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter group name"
                  placeholderTextColor="#A0AEC0"
                  value={groupName}
                  onChangeText={setGroupName}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <MapPin size={18} color="#008080" />
                  <Text style={styles.inputLabel}>Destination</Text>
                </View>
                <View style={[styles.input, styles.disabledInput]}>
                  <Text style={styles.disabledText}>
                    {initialDestination}
                  </Text>
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Clock size={18} color="#008080" />
                  <Text style={styles.inputLabel}>Departure Time</Text>
                </View>
                <View style={[styles.input, styles.disabledInput]}>
                  <Text style={styles.disabledText}>
                    {initialDepartureTime}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={handleSubmit}
                activeOpacity={0.7}
              >
                <Text style={styles.submitButtonText}>Create Group</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    backgroundColor: '#008080',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  formContainer: {
    padding: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#00808030',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F7FAFC',
  },
  disabledInput: {
    backgroundColor: '#F0F5F5',
    borderColor: '#00808020',
  },
  disabledText: {
    color: '#555',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#00808020',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRightWidth: 0.5,
    borderRightColor: '#00808020',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#008080',
    borderLeftWidth: 0.5,
    borderLeftColor: '#00808020',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});