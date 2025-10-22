import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Image,
    StyleSheet,
    Animated,
    Text,
    Alert,
    StatusBar,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";

import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useUser } from "../context/UserContext";

export default function SplashScreen({ navigation }: any) {
    // Animation values
    const contentAnim = useRef(new Animated.Value(0)).current;
    const logoBreathAnim = useRef(new Animated.Value(1)).current; // For the breathing effect

    // State Management
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [statusText, setStatusText] = useState("Connecting...");
    const { user, setUser } = useUser();

    // --- State for the Typing Effect ---
    const [displayedStatusText, setDisplayedStatusText] = useState("");
    const [showCursor, setShowCursor] = useState(true);

    // --- Main Effect for Startup and Animations ---
    useEffect(() => {
        // Entrance animation
        Animated.timing(contentAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
        }).start();

        // Logo breathing animation loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(logoBreathAnim, {
                    toValue: 1.05, // Scale up
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(logoBreathAnim, {
                    toValue: 1, // Scale back down
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Listeners
        const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
            setStatusText(state.isConnected ? "Verifying session..." : "No internet connection");
        });

        const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsAuthChecked(true);
        });

        return () => {
            netInfoUnsubscribe();
            authUnsubscribe();
        };
    }, []);

    // --- Effect for the Typing Animation ---
    useEffect(() => {
        setDisplayedStatusText(""); // Reset text when status changes
        let index = 0;
        const typingInterval = setInterval(() => {
            if (index < statusText.length) {
                setDisplayedStatusText((prev) => prev + statusText.charAt(index));
                index++;
            } else {
                clearInterval(typingInterval);
            }
        }, 100); // Typing speed

        return () => clearInterval(typingInterval);
    }, [statusText]); // Re-run this effect whenever the main statusText changes

    // --- Effect for the Blinking Cursor ---
    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 500); // Cursor blink speed
        return () => clearInterval(cursorInterval);
    }, []);

    // --- Effect for Navigation Logic ---
    useEffect(() => {
        if (isConnected === null || !isAuthChecked) {
            return;
        }

        const navigationTimeout = setTimeout(() => {
            if (isConnected) {
                navigation.replace(user ? "Maps" : "Login");
            } else {
                Alert.alert("No Internet", "Please check your connection and restart the app.");
            }
        }, 1500); // Delay to allow animations to be seen

        return () => clearTimeout(navigationTimeout);
    }, [isConnected, isAuthChecked, user, navigation]);

    // Interpolate animation values
    const slideUp = contentAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0],
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.mainContent}>
                <Animated.View style={{
                    opacity: contentAnim,
                    transform: [{ translateY: slideUp }, { scale: logoBreathAnim }]
                }}>
                    <Image
                        source={require("../assets/TourkitaLogo.jpg")}
                        style={styles.appLogo}
                    />
                </Animated.View>
                <Animated.Text style={[styles.appName, { opacity: contentAnim }]}>
                    TourKita
                </Animated.Text>
            </View>

            <View style={styles.footerContainer}>
                <Text style={styles.statusText}>
                    {displayedStatusText}
                    {showCursor && <Text style={styles.cursor}>|</Text>}
                </Text>
            </View>
        </View>
    );
}

// --- UPDATED STYLES ---
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
        width: 180,
        height: 180,
        borderRadius: 40,
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
        height: 30, // Reserve space to prevent layout shift
    },
    statusText: {
        fontSize: 15,
        color: '#8D6E63',
        fontFamily: 'monospace', // Gives a more "typewriter" feel
    },
    cursor: {
        color: '#8D6E63',
        fontSize: 15,
        fontWeight: 'bold',
    },
});