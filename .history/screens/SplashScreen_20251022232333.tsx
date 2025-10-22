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

    const slideUp = contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Optional: Add a subtle grid animation in the background */}
            <LottieView
                source={require('../assets/animations/grid-background.json')}
                style={styles.gridBackground}
                autoPlay
                loop
            />

            <View style={styles.mainContent}>
                <Animated.Image
                    source={require("../assets/TourkitaLogo_Outline.png")} // Use an outline version of your logo
                    style={[styles.appLogo, { opacity: contentAnim }]}
                />
                <Animated.Text style={[styles.appName, { opacity: contentAnim, transform: [{ translateY: slideUp }] }]}>
                    TOURKITA
                </Animated.Text>
            </View>

            <Animated.View style={[styles.footerContainer, { opacity: contentAnim }]}>
                <LottieView
                    source={require('../assets/animations/line-loader.json')} // A simple line-based loader
                    style={styles.lottie}
                    autoPlay
                    loop
                />
                <Text style={styles.version}>v1.0.0</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0A2342', // Deep navy blue
    },
    gridBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.1,
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appLogo: {
        width: 150,
        height: 150,
        tintColor: '#FFFFFF', // Tints the outline logo white
    },
    appName: {
        marginTop: 16,
        fontSize: 40,
        fontWeight: '300', // A lighter font weight
        color: '#FFFFFF',
        letterSpacing: 8, // Wide letter spacing for a technical feel
    },
    footerContainer: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
    },
    lottie: {
        width: 100,
        height: 50,
    },
    version: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        letterSpacing: 1,
    },
});import React, { useEffect, useRef, useState } from "react";
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
    
    const slideUp = contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Optional: Add a subtle grid animation in the background */}
            <LottieView
                source={require('../assets/animations/grid-background.json')}
                style={styles.gridBackground}
                autoPlay
                loop
            />

            <View style={styles.mainContent}>
                <Animated.Image
                    source={require("../assets/TourkitaLogo_Outline.png")} // Use an outline version of your logo
                    style={[styles.appLogo, { opacity: contentAnim }]}
                />
                <Animated.Text style={[styles.appName, { opacity: contentAnim, transform: [{ translateY: slideUp }] }]}>
                    TOURKITA
                </Animated.Text>
            </View>

            <Animated.View style={[styles.footerContainer, { opacity: contentAnim }]}>
                 <LottieView
                    source={require('../assets/animations/line-loader.json')} // A simple line-based loader
                    style={styles.lottie}
                    autoPlay
                    loop
                />
                <Text style={styles.version}>v1.0.0</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0A2342', // Deep navy blue
    },
    gridBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.1,
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appLogo: {
        width: 150,
        height: 150,
        tintColor: '#FFFFFF', // Tints the outline logo white
    },
    appName: {
        marginTop: 16,
        fontSize: 40,
        fontWeight: '300', // A lighter font weight
        color: '#FFFFFF',
        letterSpacing: 8, // Wide letter spacing for a technical feel
    },
    footerContainer: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
    },
    lottie: {
        width: 100,
        height: 50,
    },
    version: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        letterSpacing: 1,
    },
});import React, { useEffect, useRef, useState } from "react";
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
    
    const slideUp = contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Optional: Add a subtle grid animation in the background */}
            <LottieView
                source={require('../assets/animations/grid-background.json')}
                style={styles.gridBackground}
                autoPlay
                loop
            />

            <View style={styles.mainContent}>
                <Animated.Image
                    source={require("../assets/TourkitaLogo_Outline.png")} // Use an outline version of your logo
                    style={[styles.appLogo, { opacity: contentAnim }]}
                />
                <Animated.Text style={[styles.appName, { opacity: contentAnim, transform: [{ translateY: slideUp }] }]}>
                    TOURKITA
                </Animated.Text>
            </View>

            <Animated.View style={[styles.footerContainer, { opacity: contentAnim }]}>
                 <LottieView
                    source={require('../assets/animations/line-loader.json')} // A simple line-based loader
                    style={styles.lottie}
                    autoPlay
                    loop
                />
                <Text style={styles.version}>v1.0.0</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0A2342', // Deep navy blue
    },
    gridBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.1,
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    appLogo: {
        width: 150,
        height: 150,
        tintColor: '#FFFFFF', // Tints the outline logo white
    },
    appName: {
        marginTop: 16,
        fontSize: 40,
        fontWeight: '300', // A lighter font weight
        color: '#FFFFFF',
        letterSpacing: 8, // Wide letter spacing for a technical feel
    },
    footerContainer: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
    },
    lottie: {
        width: 100,
        height: 50,
    },
    version: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 12,
        letterSpacing: 1,
    },
});