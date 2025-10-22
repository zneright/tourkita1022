import React, { useEffect, useRef, useState } from "react";
import { View, Image, StyleSheet, Animated, Text, Alert } from "react-native";
import NetInfo from "@react-native-community/netinfo";

import { auth } from "../firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { useUser } from "../context/UserContext";

export default function SplashScreen({ navigation }: any) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const loadingProgress = useRef(new Animated.Value(0)).current;

    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isAuthChecked, setIsAuthChecked] = useState(false); 
    const { user, setUser } = useUser(); 

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                tension: 80,
                useNativeDriver: true,
            }),
            Animated.timing(loadingProgress, {
                toValue: 1,
                duration: 3500,
                useNativeDriver: false,
            }),
        ]).start();

        // Listener for internet connection
        const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
        });

        // --- NEW: Listener for Firebase Auth State ---
        const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser); // Set the user in your global context
            setIsAuthChecked(true); // Mark the authentication check as complete
        });

        // Cleanup function to remove listeners
        return () => {
            netInfoUnsubscribe();
            authUnsubscribe();
        };
    }, []); // Run this effect only once on mount

    // --- NEW: Effect for handling navigation ---
    useEffect(() => {
       
        if (isConnected === null || !isAuthChecked) {
            return;
        }

        const navigationTimeout = setTimeout(() => {
            if (isConnected) {
                // If connected, navigate based on user status
                if (user) {
                    navigation.replace("Maps"); // User is logged in, go to main app
                } else {
                    navigation.replace("Login"); // User is not logged in, go to login
                }
            } else {
                // If not connected, show an alert
                Alert.alert(
                    "No Internet",
                    "Please check your connection and restart the app."
                );
            }
        }, 1500); // A short delay so the splash isn't too jarringly fast

        return () => clearTimeout(navigationTimeout);

    }, [isConnected, isAuthChecked, user, navigation]);


    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.innerContainer,
                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                ]}
            >
                <Image
                    source={require("../assets/TourkitaLogo.jpg")}
                    style={styles.appLogo}
                    resizeMode="contain"
                />

                <Text style={styles.tagline}>
                    Explore the beauty of Intramuros
                </Text>

                <Image
                    source={{
                        uri: "https://intramuros.gov.ph/wp-content/uploads/2022/07/IA-Logo-1.png",
                    }}
                    style={styles.partnerLogo}
                    resizeMode="contain"
                />

                <Text style={styles.version}>Version 1.0.0</Text>

                <View style={styles.progressContainer}>
                    <Animated.View
                        style={[
                            styles.progressBar,
                            {
                                width: loadingProgress.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ["0%", "100%"],
                                }),
                            },
                        ]}
                    />
                </View>

                {isConnected === false && (
                    <Text style={styles.errorText}>
                        No internet connection detected...
                    </Text>
                )}
            </Animated.View>
        </View>
    );
}

// Styles remain the same
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F0E6",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    innerContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    appLogo: {
        width: 220,
        height: 220,
        marginBottom: 20,
    },
    tagline: {
        fontSize: 18,
        color: "#333",
        fontWeight: "600",
        marginBottom: 30,
        textAlign: "center",
        letterSpacing: 1,
    },
    version: {
        fontSize: 14,
        color: "#777",
        marginTop: 20,
        marginBottom: 10,
        textAlign: "center",
    },
    partnerLogo: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    progressContainer: {
        width: "80%",
        height: 8,
        backgroundColor: "#e0e0e0",
        borderRadius: 4,
        marginTop: 20,
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#603F26",
        borderRadius: 4,
    },
    errorText: {
        marginTop: 10,
        color: "red",
        fontSize: 14,
        fontWeight: "500",
    },
});