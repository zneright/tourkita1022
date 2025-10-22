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
import LottieView from "lottie-react-native"; // Import Lottie

// --- IMPORTS FOR AUTHENTICATION ---
import { auth } from "../firebase"; // Your firebase config
import { onAuthStateChanged, User } from "firebase/auth";
import { useUser } from "../context/UserContext"; // Your user context

// --- TYPESCRIPT: Define props for the component ---
type SplashScreenProps = {
    navigation: {
        replace: (screenName: string) => void;
    };
};

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
    // --- ANIMATION VALUES ---
    const contentAnim = useRef(new Animated.Value(0)).current;
    const logoBreathAnim = useRef(new Animated.Value(1)).current;

    // --- STATE MANAGEMENT ---
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
    const { user, setUser } = useUser(); // From your context

    // --- MAIN EFFECT: Handles startup logic and animations ---
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

        // Network connection listener
        const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
        });

        // Firebase authentication listener
        const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
            setUser(firebaseUser);
            setIsAuthChecked(true);
        });

        // Cleanup function
        return () => {
            netInfoUnsubscribe();
            authUnsubscribe();
        };
    }, []); // Empty dependency array ensures this runs only once

    // --- NAVIGATION EFFECT: Triggers when all checks are complete ---
    useEffect(() => {
        if (isConnected === null || !isAuthChecked) {
            return; // Wait until both network and auth checks are done
        }

        const navigationTimeout = setTimeout(() => {
            if (isConnected) {
                // If a user object exists, they are logged in.
                navigation.replace(user ? "Maps" : "Login");
            } else {
                Alert.alert("No Internet", "Please check your connection and restart the app.");
            }
        }, 1500); // A delay to ensure animations are seen

        return () => clearTimeout(navigationTimeout);
    }, [isConnected, isAuthChecked, user, navigation]); // Re-run when these values change

    // Interpolate animation values for a smooth slide-up effect
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

            <Animated.View style={[styles.footerContainer, { opacity: contentAnim }]}>
                <LottieView
                    source={require('../assets/animations/loading-dots.json')} // Ensure this path is correct!
                    style={styles.lottie}
                    autoPlay
                    loop
                />
                <Text style={styles.version}>Version 1.0.0</Text>
            </Animated.View>
        </View>
    );
};

// --- STYLES ---
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
        bottom: 50,
        alignItems: 'center',
    },
    lottie: {
        width: 80,
        height: 80,
    },
    version: {
        fontSize: 12,
        color: '#A1887F',
        marginTop: -15, // Adjust to position nicely under the Lottie animation
    },
});

export default SplashScreen;