import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Image,
    StyleSheet,
    Animated,
    Text,
    Alert,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { LinearGradient } from 'expo-linear-gradient';

// --- NEW IMPORTS FOR AUTHENTICATION ---
import { auth } from "../firebase"; // Your firebase config
import { onAuthStateChanged } from "firebase/auth";
import { useUser } from "../context/UserContext"; // Assuming you have a user context

export default function SplashScreen({ navigation }: any) {
    // A single animation value for a cleaner, combined effect
    const contentAnim = useRef(new Animated.Value(0)).current;

    // --- STATE MANAGEMENT ---
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isAuthChecked, setIsAuthChecked] = useState(false); // Tracks if Firebase check is done
    const [statusText, setStatusText] = useState("Initializing..."); // Dynamic loading text
    const { user, setUser } = useUser(); // Get user from your global context

    // --- EFFECT FOR ANIMATIONS AND LISTENERS ---
    useEffect(() => {
        // A single, smoother animation for all content
        Animated.timing(contentAnim, {
            toValue: 1,
            duration: 1200, // A graceful fade-in duration
            useNativeDriver: true,
        }).start();

        // Listener for internet connection
        const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
            if (state.isConnected) {
                setStatusText("Verifying session...");
            } else {
                setStatusText("No internet connection");
            }
        });

        // --- NEW: Listener for Firebase Auth State ---
        const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);   // Set the user in your global context
            setIsAuthChecked(true); // Mark the authentication check as complete
        });

        // Cleanup function to remove listeners when the component unmounts
        return () => {
            netInfoUnsubscribe();
            authUnsubscribe();
        };
    }, []); // The empty array ensures this runs only once on mount

    // --- NEW: EFFECT FOR HANDLING NAVIGATION ---
    useEffect(() => {
        // We wait until we have both connection status AND auth status
        if (isConnected === null || !isAuthChecked) {
            return; // Do nothing until both checks are complete
        }

        // Add a short delay to prevent the splash screen from flashing too quickly
        const navigationTimeout = setTimeout(() => {
            if (isConnected) {
                // If connected, navigate based on whether a user exists
                navigation.replace(user ? "Maps" : "Login");
            } else {
                // If not connected, show an alert
                Alert.alert(
                    "No Internet",
                    "Please check your connection and restart the app."
                );
            }
        }, 1000); // 1-second delay

        return () => clearTimeout(navigationTimeout);
    }, [isConnected, isAuthChecked, user, navigation]); // This effect re-runs when these values change

    // Interpolate animation values for a combined fade and slide effect
    const slideUp = contentAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0], // Starts 20px down and moves up
    });

    return (
        <LinearGradient
            colors={['#F9F4F0', '#EAE0D5']}
            style={styles.container}
        >
            <StatusBar barStyle="dark-content" />

            <View style={styles.mainContent}>
                <Animated.View style={{ opacity: contentAnim, transform: [{ translateY: slideUp }] }}>
                    <Image
                        source={require("../assets/TourkitaLogo.jpg")}
                        style={styles.appLogo} // Style updated to have no border
                    />
                </Animated.View>
                <Animated.Text style={[styles.appName, { opacity: contentAnim }]}>
                    TourKita
                </Animated.Text>
            </View>

            <View style={styles.footerContainer}>
                <ActivityIndicator size="small" color="#6D4C41" />
                <Text style={styles.statusText}>{statusText}</Text>
            </View>
        </LinearGradient>
    );
}

// --- NEW AND ENHANCED STYLES ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appLogo: {
        width: 180,
        height: 180,
        borderRadius: 40, // Softens the corners for a modern look
        // NO BORDER
    },
    appName: {
        marginTop: 24,
        fontSize: 44,
        fontWeight: 'bold',
        color: '#4E342E',
    },
    footerContainer: {
        position: 'absolute',
        bottom: 60,
        alignItems: 'center',
    },
    statusText: {
        marginTop: 12,
        fontSize: 14,
        color: '#8D6E63',
    },
});