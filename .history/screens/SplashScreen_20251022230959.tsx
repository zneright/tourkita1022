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
import { LinearGradient } from 'expo-linear-gradient'; // For the beautiful background

import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useUser } from "../context/UserContext";

export default function SplashScreen({ navigation }: any) {
    // A single animation value for a combined fade and slide effect
    const contentAnim = useRef(new Animated.Value(0)).current;

    // State Management
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [statusText, setStatusText] = useState("Initializing...");
    const { user, setUser } = useUser();

    // Effect for animations and listeners
    useEffect(() => {
        // A classic fade-in and slide-up animation
        Animated.timing(contentAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
        }).start();

        const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
            if (state.isConnected) {
                setStatusText("Checking for updates...");
            } else {
                setStatusText("No internet connection");
            }
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

    // Effect for handling navigation
    useEffect(() => {
        if (isConnected === null || !isAuthChecked) {
            return;
        }

        const navigationTimeout = setTimeout(() => {
            if (isConnected) {
                navigation.replace(user ? "Maps" : "Login");
            } else {
                Alert.alert(
                    "No Internet",
                    "Please check your connection and restart the app."
                );
            }
        }, 1500);

        return () => clearTimeout(navigationTimeout);
    }, [isConnected, isAuthChecked, user, navigation]);

    // Interpolate animation values
    const slideUp = contentAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [30, 0], // Starts 30px down, moves to 0
    });
    const fadeIn = contentAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1], // Fades from 0 to 1 opacity
    });

    return (
        <LinearGradient
            colors={['#F9F4F0', '#EAE0D5']} // A very subtle, clean gradient
            style={styles.container}
        >
            <StatusBar barStyle="dark-content" />

            <View style={styles.mainContent}>
                <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
                    <Image
                        source={require("../assets/TourkitaLogo.jpg")}
                        style={styles.appLogo}
                    />
                </Animated.View>
                <Animated.Text style={[styles.appName, { opacity: fadeIn }]}>
                    TourKita
                </Animated.Text>
            </View>

            <View style={styles.footerContainer}>
                <ActivityIndicator size="small" color="#6D4C41" />
                <Text style={styles.statusText}>{statusText}</Text>
                <Text style={styles.version}>Version 1.0.0</Text>
            </View>
        </LinearGradient>
    );
}

// --- STYLES FOR CLASSIC DESIGN ---
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
        width: 160,
        height: 160,
        borderRadius: 32,
    },
    appName: {
        marginTop: 24,
        fontSize: 40,
        fontWeight: '700',
        color: '#4E342E',
    },
    footerContainer: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
    },
    statusText: {
        marginTop: 12,
        fontSize: 14,
        color: '#8D6E63',
    },
    version: {
        marginTop: 4,
        fontSize: 12,
        color: '#A1887F',
    },
});