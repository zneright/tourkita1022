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

// --- IMPORTS FOR AUTHENTICATION ---
import { auth } from "../firebase"; // Ensure this path is correct
import { onAuthStateChanged } from "firebase/auth";
import { useUser } from "../context/UserContext"; // Your user context

// Define the component's props for TypeScript
type SplashScreenProps = {
    navigation: {
        replace: (screenName: string) => void;
    };
};

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
    // A single animation value for a cleaner, combined effect
    const contentAnim = useRef(new Animated.Value(0)).current;

    // --- STATE MANAGEMENT ---
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
    const [statusText, setStatusText] = useState<string>("Initializing...");

    // Get all necessary functions and state from the user context
    const { user, setUser, setIsGuest } = useUser();

    // --- EFFECT #1: Handles animations and sets up listeners ---
    useEffect(() => {
        // A single, graceful fade-in and slide-up animation
        Animated.timing(contentAnim, {
            toValue: 1,
            duration: 1200,
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

        // --- Listener for Firebase Auth State (Handles Persistent Login) ---
        const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            // Correctly set the guest status based on the user's anonymous state
            setIsGuest(firebaseUser?.isAnonymous || false);
            setIsAuthChecked(true); // Mark the authentication check as complete
        });

        // Cleanup function to remove listeners when the screen unmounts
        return () => {
            netInfoUnsubscribe();
            authUnsubscribe();
        };
    }, []); // The empty array ensures this runs only once on mount

    // --- EFFECT #2: Handles navigation logic ---
    useEffect(() => {
        // We wait until we have results for BOTH connection AND auth checks
        if (isConnected === null || !isAuthChecked) {
            return; // Do nothing until both checks are complete
        }

        // A short delay to prevent the splash screen from flashing too quickly
        const navigationTimeout = setTimeout(() => {
            if (isConnected) {
                navigation.replace(user ? "Maps" : "Login");
            } else {
                Alert.alert(
                    "No Internet",
                    "Please check your connection and restart the app."
                );
            }
        }, 1000); 

        return () => clearTimeout(navigationTimeout);
    }, [isConnected, isAuthChecked, user, navigation]); 

    const slideUp = contentAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0], 
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.mainContent}>
                <Animated.View style={{ opacity: contentAnim, transform: [{ translateY: slideUp }] }}>
                    <Image
                        source={require("../assets/TourkitaLogo.jpg")}
                        style={styles.appLogo}
                    />
                </Animated.View>
            </View>

            <View style={styles.footerContainer}>
                <ActivityIndicator size="small" color="#6D4C41" />
                <Text style={styles.statusText}>{statusText}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F4F0',
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appLogo: {
        width: 220,
        height: 220,
        borderRadius: 50,
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

export default SplashScreen;