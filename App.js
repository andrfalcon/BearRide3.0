import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import MessagingScreen from './screens/MessagingScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="Messaging" 
          component={MessagingScreen}
          options={{
            headerShown: true,
            headerTitle: '',
            headerStyle: {
              backgroundColor: '#f5f5f5',
            },
            headerTintColor: '#2c3e50',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
