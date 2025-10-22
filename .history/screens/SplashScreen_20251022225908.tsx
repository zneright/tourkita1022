import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Image,
    StyleSheet,
    Animated,
    Text,
    Alert,
    StatusBar,
    ImageBackground, // Import ImageBackground
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useUser } from "../context/UserContext";

const BACKGROUND_IMAGE = { uri: "https://images.unsplash.com/photo-1618753273233-525c61134268?q=80&w=1932&auto=format&fit=crop" };

export default function SplashScreen({ navigation }: any) {
    // Animation values for sequencing
    const logoAnim = useRef(new Animated.Value(0)).current;
    const textAnim = useRef(new Animated.Value(0)).current;
    const footerAnim = useRef(new Animated.Value(0)).current;

    // State Management
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [statusText, setStatusText] = useState("Connecting..."); // Dynamic status text
    const { user, setUser } = useUser();

    // Effect for animations and listeners
    useEffect(() => {
        // Sequential animation for a graceful entrance
        Animated.sequence([
            Animated.timing(logoAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(textAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(footerAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();

        const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
            if (state.isConnected) {
                setStatusText("Checking Account...");
            } else {
                setStatusText("No Internet Connection");
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
        }, 1000); // Shorter delay as the UI is more engaging

        return () => clearTimeout(navigationTimeout);
    }, [isConnected, isAuthChecked, user, navigation]);

    return (
        <ImageBackground source={BACKGROUND_IMAGE} style={styles.background}>
            <StatusBar barStyle="light-content" />
            {/* "Frosted Glass" Overlay */}
            <View style={styles.overlay} />

            <View style={styles.mainContent}>
                <Animated.View style={{ opacity: logoAnim, transform: [{ scale: logoAnim }] }}>
                    <Image
                        source={require("../assets/TourkitaLogo.jpg")}
                        style={styles.appLogo}
                    />
                </Animated.View>

                <Animated.View style={{ opacity: textAnim }}>
                    <Text style={styles.appName}>TourKita</Text>
                    <Text style={styles.tagline}>Explore the Walled City</Text>
                </Animated.View>
            </View>

            <Animated.View style={[styles.footerContainer, { opacity: footerAnim }]}>
                <Text style={styles.statusText}>{statusText}</Text>
                <Text style={styles.version}>Version 1.0.0</Text>
            </Animated.View>
        </ImageBackground>
    );
}

// --- NEW STYLES FOR THEMATIC DESIGN ---
const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject, // Cover the entire screen
        backgroundColor: 'rgba(62, 39, 35, 0.6)', // Dark brown semi-transparent overlay
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 60, // Push content up slightly
    },
    appLogo: {
        width: 160,
        height: 160,
        borderRadius: 30,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 3,
        marginBottom: 20,
    },
    appName: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 2 },
        textShadowRadius: 4,
    },
    tagline: {
        fontSize: 18,
        color: '#F5F5F5',
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 4,
    },
    footerContainer: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
    },
    statusText: {
        color: '#E0E0E0',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    version: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
    },
});