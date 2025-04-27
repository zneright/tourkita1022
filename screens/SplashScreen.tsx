import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, Animated, Text } from "react-native";

export default function SplashScreen({ navigation }: any) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current; // Start a little smaller
    const loadingProgress = useRef(new Animated.Value(0)).current; // For the loading progress

    useEffect(() => {
        // Animated parallel for logo fade-in and scale-up
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
            // Animated progress bar from 0 to 100%
            Animated.timing(loadingProgress, {
                toValue: 1,
                duration: 2800, // Duration of the loading progress animation
                useNativeDriver: false, // Since it's a width animation, no need for native driver
            }),
        ]).start();

        // Timeout to navigate after the splash screen completes
        const timeout = setTimeout(() => {
            navigation.replace("Login");
        }, 2800);

        return () => clearTimeout(timeout);
    }, [navigation, fadeAnim, scaleAnim, loadingProgress]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.innerContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <Image
                    source={require('../assets/TourkitaLogo.jpg')}
                    style={styles.appLogo}
                    resizeMode="contain"
                />
                <Text style={styles.tagline}>Explore the beauty of Intramuros</Text>

                <Image
                    source={{
                        uri: "https://intramuros.gov.ph/wp-content/uploads/2022/07/IA-Logo-1.png",
                    }}
                    style={styles.partnerLogo}
                    resizeMode="contain"
                />

                <Text style={styles.version}>Version 1.0.0</Text>

                {/* Progress bar animation */}
                <View style={styles.progressContainer}>
                    <Animated.View
                        style={[styles.progressBar, {
                            width: loadingProgress.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                            })
                        }]}
                    />
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F0E6", // light beige for Intramuros vibe
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
        width: '80%', // Width of the progress bar container
        height: 8, // Height of the progress bar
        backgroundColor: "#e0e0e0", // Light background color for the bar
        borderRadius: 4,
        marginTop: 20,
    },
    progressBar: {
        height: '100%',
        backgroundColor: "#603F26", // Soft blue progress color
        borderRadius: 4,
    },
});
