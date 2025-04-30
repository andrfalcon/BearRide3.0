import { useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Camera } from "lucide-react-native"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../firebaseConfig"

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [profileImage, setProfileImage] = useState(null)
  const [isEmailFocused, setIsEmailFocused] = useState(false)
  const [isNameFocused, setIsNameFocused] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(false)

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== "granted") {
      Alert.alert("Permission needed", "Please grant permission to access your photos")
      return
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri)
    }
  }

  const handleSubmit = async () => {
    // Validate inputs
    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email address")
      return
    }

    if (!password.trim()) {
      Alert.alert("Password required", "Please enter your password")
      return
    }

    if (!isLogin && !fullName.trim()) {
      Alert.alert("Name required", "Please enter your full name")
      return
    }

    // Check if email is a valid Berkeley email
    if (!email.toLowerCase().endsWith("@berkeley.edu")) {
      Alert.alert(
        "Invalid Email",
        "You must use a UC Berkeley email address (@berkeley.edu) to use BearRide"
      )
      return
    }

    setIsLoading(true)
    const auth = getAuth()

    try {
      if (isLogin) {
        // Handle login
        await signInWithEmailAndPassword(auth, email, password)
        navigation.navigate('Welcome')
      } else {
        // Handle signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          fullName,
          email,
          createdAt: new Date().toISOString(),
        })

        navigation.navigate('Welcome')
      }
    } catch (error) {
      let errorMessage = "An error occurred. Please try again."
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please login instead."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters."
      } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password."
      }
      Alert.alert("Error", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{isLogin ? "Welcome Back" : "Create BearRide Profile"}</Text>
            <Text style={styles.subtitle}>{isLogin ? "Sign in to continue" : "Please enter your details below"}</Text>
          </View>

          {!isLogin && (
            <View style={styles.profileImageContainer}>
              <TouchableOpacity style={styles.profileImageWrapper} onPress={pickImage}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Camera color="#008080" size={40} />
                    <Text style={styles.uploadText}>Upload Photo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.form}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[styles.input, isNameFocused && styles.inputFocused]}
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, isEmailFocused && styles.inputFocused]}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, isPasswordFocused && styles.inputFocused]}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{isLogin ? "Sign In" : "Sign Up"}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchButtonText}>
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
  },
  profileImageContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    backgroundColor: "#E5F6F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#008080",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profileImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    color: "#008080",
    fontWeight: "500",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#1F2937",
  },
  inputFocused: {
    borderColor: "#008080",
    borderWidth: 2,
  },
  button: {
    backgroundColor: "#008080",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#008080",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    color: "#6B7280",
  },
  footerLink: {
    color: "#008080",
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  switchButton: {
    marginTop: 16,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#008080",
    fontSize: 16,
    fontWeight: "500",
  },
})
