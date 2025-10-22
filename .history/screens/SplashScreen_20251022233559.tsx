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

import { auth } from "../firebase"; //
import { onAuthStateChanged } from "firebase/auth";
import { useUser } from "../context/UserContext"; 

export default function SplashScreen({ navigation }: any) {
    const contentAnim = useRef(new Animated.Value(0)).current;

    // --- STATE MANAGEMENT ---
    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [isAuthChecked, setIsAuthChecked] = useState(false); 
    const [statusText, setStatusText] = useState("Initializing...");
    const { user, setUser } = useUser();

    useEffect(() => {
        Animated.timing(contentAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
        }).start();

        const netInfoUnsubscribe = NetInfo.addEventListener((state) => {
            setIsConnected(state.isConnected);
            if (state.isConnected) {
                setStatusText("Verifying session...");
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
}

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
        height: 180,
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