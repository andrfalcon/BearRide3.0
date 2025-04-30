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
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Camera } from "lucide-react-native"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [profileImage, setProfileImage] = useState(null)
  const [isEmailFocused, setIsEmailFocused] = useState(false)
  const [isNameFocused, setIsNameFocused] = useState(false)

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

  const handleSubmit = () => {
    // Validate inputs
    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email address")
      return
    }

    if (!fullName.trim()) {
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

    // Here you would typically handle the login/signup process
    Alert.alert("Success", "Profile information submitted successfully")
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Create BearRide Profile</Text>
            <Text style={styles.subtitle}>Please enter your details below</Text>
          </View>

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

          <View style={styles.form}>
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

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>

            {/* <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account? <Text style={styles.footerLink}>Sign In</Text>
              </Text>
            </View> */}
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
})
