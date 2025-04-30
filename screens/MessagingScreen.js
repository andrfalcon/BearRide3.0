import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function MessagingScreen({ route, navigation }) {
  const { groupId, groupName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const auth = getAuth();

  useEffect(() => {
    navigation.setOptions({
      title: groupName,
    });

    const q = query(
      collection(db, `groups/${groupId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = [];
      snapshot.forEach((doc) => {
        messageList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setMessages(messageList);
    });

    return () => unsubscribe();
  }, [groupId, groupName]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, `groups/${groupId}/messages`), {
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === auth.currentUser?.uid;

    return (
      <View style={[
        styles.messageWrapper,
        isCurrentUser ? styles.currentUserWrapper : styles.otherUserWrapper
      ]}>
        {!isCurrentUser && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
        <LinearGradient
          colors={isCurrentUser ? ['#4A90E2', '#357ABD'] : ['#FFFFFF', '#F5F5F5']}
          style={[
            styles.messageContainer,
            isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
          ]}
        >
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.timestamp,
            isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </LinearGradient>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
      />
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons name="send" size={24} color={newMessage.trim() ? "#fff" : "#ccc"} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 15,
  },
  messageWrapper: {
    marginVertical: 4,
    maxWidth: width * 0.75,
  },
  currentUserWrapper: {
    alignSelf: 'flex-end',
  },
  otherUserWrapper: {
    alignSelf: 'flex-start',
  },
  messageContainer: {
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserMessage: {
    borderBottomRightRadius: 4,
  },
  otherUserMessage: {
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  currentUserText: {
    color: '#FFFFFF',
  },
  otherUserText: {
    color: '#2C3E50',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  currentUserTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherUserTimestamp: {
    color: '#999',
  },
  inputContainer: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
}); 