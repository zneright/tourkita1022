import React, { useEffect, useRef, useState } from "react";
import { View, Image, StyleSheet, Animated, Text, Alert } from "react-native";
import NetInfo from "@react-native-community/netinfo";

export default function SplashScreen({ navigation }: any) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const loadingProgress = useRef(new Animated.Value(0)).current;
    const [isConnected, setIsConnected] = useState<boolean | null>(null);

    useEffect(() => {
        // Run animations
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

        // Check internet connection
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
        });

        // Simulate loading (e.g., fetching config, assets)
        const timeout = setTimeout(() => {
            if (isConnected) {
                navigation.replace("Login");
            } else {
                Alert.alert(
                    "No Internet",
                    "Please check your connection and restart the app."
                );
            }
        }, 3500);

        return () => {
            clearTimeout(timeout);
            unsubscribe();
        };
    }, [navigation, fadeAnim, scaleAnim, loadingProgress, isConnected]);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.innerContainer,
                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                ]}
            >
                {/* Main Logo */}
                <Image
                    source={require("../assets/TourkitaLogo.jpg")}
                    style={styles.appLogo}
                    resizeMode="contain"
                />

                {/* Tagline */}
                <Text style={styles.tagline}>
                    Explore the beauty of Intramuros
                </Text>

                {/* Partner Logo */}
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
