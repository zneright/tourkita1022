import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Image,
    StyleSheet,
    Animated,
    Text,
    Alert,
    ActivityIndicator, // Use a cleaner loading indicator
    StatusBar // To control the status bar style
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { LinearGradient } from 'expo-linear-gradient'; // For the beautiful background

import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useUser } from "../context/UserContext";

export default function SplashScreen({ navigation }: any) {
    const contentAnim = useRef(new Animated.Value(0)).current; // One animation value for all content

    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const { user, setUser } = useUser();

    // Effect for animations and listeners
    useEffect(() => {
        // A single, smoother spring animation for all content
        Animated.spring(contentAnim, {
            toValue: 1,
            friction: 6,
            tension: 70,
            useNativeDriver: true,
        }).start();

        const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
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

    // Effect for handling navigation (logic is the same)
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

    return (
        // Use a LinearGradient for the background
        <LinearGradient
            colors={['#F9F4F0', '#EAE0D5', '#D6C6B5']}
            style={styles.container}
        >
            <StatusBar barStyle="dark-content" />
            <Animated.View
                style={[
                    styles.contentContainer,
                    {
                        opacity: contentAnim,
                        transform: [{
                            scale: contentAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.85, 1],
                            })
                        }]
                    },
                ]}
            >
                <Image
                    source={require("../assets/TourkitaLogo.jpg")}
                    style={styles.appLogo}
                />
                <Text style={styles.appName}>TourKita</Text>
                <Text style={styles.tagline}>
                    Your Gateway to Historic Intramuros
                </Text>
            </Animated.View>

            <Animated.View style={[styles.footerContainer, { opacity: contentAnim }]}>
                {isConnected === null || !isAuthChecked ? (
                    <ActivityIndicator size="small" color="#5D4037" />
                ) : null}

                {isConnected === false && (
                    <Text style={styles.errorText}>
                        No Internet Connection
                    </Text>
                )}

                <Text style={styles.version}>Version 1.0.0</Text>
            </Animated.View>
        </LinearGradient>
    );
}

// --- NEW AND IMPROVED STYLES ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: "100%",
    },
    appLogo: {
        width: 180,
        height: 180,
        borderRadius: 40, // Soften the edges
        marginBottom: 16,
        // Add a subtle shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    appName: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#4E342E',
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 16,
        color: '#6D4C41',
        fontWeight: '500',
        marginTop: 8,
        textAlign: "center",
    },
    footerContainer: {
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
    },
    version: {
        fontSize: 12,
        color: '#8D6E63',
        marginTop: 16,
    },
    errorText: {
        color: "#B71C1C",
        fontSize: 14,
        fontWeight: "500",
        backgroundColor: '#FFCDD2',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        overflow: 'hidden', // Ensures borderRadius is applied
        marginBottom: 10,
    },
});