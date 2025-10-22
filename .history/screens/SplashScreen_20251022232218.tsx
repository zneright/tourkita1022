import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Image,
    StyleSheet,
    Animated,
    Text,
    Alert,
    StatusBar,
    ImageBackground, // Use ImageBackground for the map
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import LottieView from "lottie-react-native";

import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useUser } from "../context/UserContext";

export default function SplashScreen({ navigation }: any) {
    const contentAnim = useRef(new Animated.Value(0)).current;

    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const { user, setUser } = useUser();

    useEffect(() => {
        Animated.timing(contentAnim, {
            toValue: 1,
            duration: 1500,
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

    useEffect(() => {
        if (isConnected === null || !isAuthChecked) return;
        const navigationTimeout = setTimeout(() => {
            if (isConnected) {
                navigation.replace(user ? "Maps" : "Login");
            } else {
                Alert.alert("No Internet", "Please check your connection and restart the app.");
            }
        }, 1500);
        return () => clearTimeout(navigationTimeout);
    }, [isConnected, isAuthChecked, user, navigation]);

    return (
        <ImageBackground
            source={require('../assets/images/vintage-map.png')} // Your map background image here
            style={styles.container}
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" />
            <View style={styles.overlay} />

            <View style={styles.mainContent}>
                <Animated.Image
                    source={require("../assets/TourkitaLogo.jpg")}
                    style={[styles.appLogo, { opacity: contentAnim, transform: [{ scale: contentAnim }] }]}
                />
                <Animated.Text style={[styles.appName, { opacity: contentAnim }]}>
                    TourKita
                </Animated.Text>
            </View>

            <Animated.View style={[styles.footerContainer, { opacity: contentAnim }]}>
                <LottieView
                    source={require('../assets/animations/compass-loading.json')} // Your new compass animation
                    style={styles.lottie}
                    autoPlay
                    loop
                />
                <Text style={styles.statusText}>Discovering Intramuros...</Text>
            </Animated.View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#6D4C41', // Fallback color
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(78, 52, 46, 0.7)', // Dark, semi-transparent overlay
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appLogo: {
        width: 160,
        height: 160,
        borderRadius: 80, // Make it a perfect circle
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    appName: {
        marginTop: 20,
        fontSize: 52,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'serif', // Use a classic serif font
        textShadowColor: 'rgba(0, 0, 0, 0.6)',
        textShadowOffset: { width: 1, height: 2 },
        textShadowRadius: 4,
    },
    footerContainer: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
    },
    lottie: {
        width: 100,
        height: 100,
    },
    statusText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginTop: -10,
    },
});