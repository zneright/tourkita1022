import React, { useEffect, useState, useRef } from "react";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Switch,
    AppState,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation/types";
import TopHeader from "../components/TopHeader";
import { Entypo, Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import BottomFooter from "../components/BottomFooter";
import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
import LandmarkMarkers from "../components/LandmarkMarkers";
import LineRoute from "../components/LineRoute";
import { useLandmark } from "../provider/LandmarkProvider";
import LineBoundary from "../components/LineBoundary";
import * as Location from 'expo-location';
import WeatherProvider from "../provider/WeatherProvider";
import CategoryFilter from "../components/CategoryFilter";
import LottieView from "lottie-react-native";
import { useUser } from "../context/UserContext";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Maps">;

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || "");

export default function MapsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [showCategories, setShowCategories] = useState(true);
    const [showBottomNav, setShowBottomNav] = useState(true);
    const [currentMap, setCurrentMap] = useState("mapbox://styles/ryanchico/cm93s4vxv003u01r9g2w28ek7");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [isLoading, setIsLoading] = useState(false);
    const [visible, setVisible] = useState(true);
    const [showUpdate, setShowUpdate] = useState(true);
    const [navigationMode, setNavigationMode] = useState(false);
    const cameraRef = useRef<Camera>(null);
    const { isGuest } = useUser();
    const PH_BOUNDS = { ne: [127.0, 21.0], sw: [116.0, 4.5] };
    const MANILA_BOUNDS = { ne: [120.980570, 14.599918], sw: [120.965740, 14.576564] };

    // --- All original functions and useEffects are preserved ---
    useEffect(() => {
        const subscription = AppState.addEventListener("change", async (nextState) => {
            const user = auth.currentUser;
            try {
                const collectionName = isGuest ? "guests" : "users";
                const userId = user?.uid || (isGuest ? "guest_temp_id" : null);
                if (!userId) return;
                const userRef = doc(db, collectionName, userId);
                if (nextState.match(/inactive|background/)) {
                    await setDoc(userRef, { activeStatus: false }, { merge: true });
                } else if (nextState === "active") {
                    await setDoc(userRef, { activeStatus: true }, { merge: true });
                }
            } catch (err) {
                console.warn("Failed to update online status:", err);
            }
        });
        return () => subscription.remove();
    }, [isGuest]);

    const toggleNavigation = () => {
        if (navigationMode) {
            setNavigationMode(false);
            cameraRef.current?.setCamera({
                centerCoordinate: undefined,
                zoomLevel: 15,
                pitch: 0,
                heading: 0,
                animationDuration: 1000,
            });
        } else {
            setNavigationMode(true);
        }
    };

    const { duration, distance, showDirection, directionCoordinates } = useLandmark();

    useEffect(() => {
        const getLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.log("Location permission not granted.");
            }
        };
        getLocation();
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#493628" barStyle="light-content" />
            <TopHeader title="Map" onSupportPress={() => navigation.navigate("Support")} />

            {showCategories && (
                <CategoryFilter
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />
            )}

            <View style={styles.arrowToggleContainer}>
                <TouchableOpacity
                    style={styles.arrowToggle}
                    onPress={() => {
                        setShowCategories(!showCategories);
                        setShowBottomNav(!showBottomNav);
                        setShowUpdate(!showUpdate);
                    }}
                >
                    <Feather name={showCategories ? "chevron-up" : "chevron-down"} size={24} color="#6D4C41" />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                <MapView style={styles.map} styleURL={currentMap} rotateEnabled>
                    <Camera
                        ref={cameraRef}
                        defaultSettings={{ centerCoordinate: [120.975427, 14.591293], zoomLevel: 15, pitch: 45 }}
                        followUserLocation={navigationMode}
                        followUserMode={navigationMode ? "course" : "normal"}
                        followZoomLevel={navigationMode ? 18 : undefined}
                        followPitch={60}
                        followBearing={true}
                        maxBounds={PH_BOUNDS}
                    />
                    <LocationPuck
                        puckBearingEnabled={true}
                        puckBearing="heading"
                        pulsing={{ isEnabled: true, color: '#3B82F6' }}
                    />
                    <LineBoundary visible={visible} />
                    <LandmarkMarkers
                        selectedCategory={selectedCategory}
                        onLoadingChange={setIsLoading}
                    />
                    {showDirection && directionCoordinates && (
                        <LineRoute coordinates={directionCoordinates} />
                    )}
                </MapView>

                {showBottomNav && (
                    <View style={styles.leftControls}>
                        <TouchableOpacity style={styles.controlButton} onPress={() => cameraRef.current?.fitBounds(MANILA_BOUNDS.ne, MANILA_BOUNDS.sw, 50, 1000)}>
                            <LottieView source={require("../assets/animations/city.json")} autoPlay loop style={styles.lottieIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.controlButton} onPress={() => cameraRef.current?.fitBounds(PH_BOUNDS.ne, PH_BOUNDS.sw, 50, 1000)}>
                            <LottieView source={require("../assets/animations/earth.json")} autoPlay loop style={styles.lottieIcon} />
                        </TouchableOpacity>
                    </View>
                )}

                {showBottomNav && (
                    <View style={styles.rightControls}>
                        <TouchableOpacity style={styles.controlButton} onPress={() => setVisible(!visible)}>
                            <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={22} color="#4E342E" />
                        </TouchableOpacity>
                        <View style={[styles.controlButton, styles.switchContainer]}>
                            <Ionicons name={!currentMap.includes('ryanchico') ? "satellite-outline" : "map-outline"} size={22} color="#4E342E" />
                            <Switch
                                value={!currentMap.includes('ryanchico')}
                                onValueChange={(val) => setCurrentMap(val ? "mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y" : "mapbox://styles/ryanchico/cm93s4vxv003u01r9g2w28ek7")}
                                trackColor={{ false: "#BCAAA4", true: "#81C784" }}
                                thumbColor={"#FFFFFF"}
                                style={styles.switchStyle}
                            />
                        </View>
                    </View>
                )}

                {showBottomNav && (
                    <TouchableOpacity onPress={toggleNavigation} style={[styles.navigationButton, { backgroundColor: navigationMode ? "#D32F2F" : "#493628" }]}>
                        <Ionicons name={navigationMode ? "close-outline" : "navigate-outline"} size={22} color="white" />
                        <Text style={styles.navigationButtonText}>{navigationMode ? "Exit Navigation" : "Start Navigation"}</Text>
                    </TouchableOpacity>
                )}

                {(showDirection || !showBottomNav) && (
                    <View style={[styles.infoPanel, !showBottomNav && styles.infoPanelExpanded]}>
                        <View style={styles.infoItem}>
                            <FontAwesome5 name="route" size={18} color="#4E342E" />
                            <Text style={styles.infoText}>{distance != null ? `${(distance / 1000).toFixed(2)} km` : "--"}</Text>
                        </View>
                        <View style={styles.infoSeparator} />
                        <View style={styles.infoItem}>
                            <Entypo name="back-in-time" size={18} color="#4E342E" />
                            <Text style={styles.infoText}>{duration != null ? `${(duration / 60).toFixed(0)} min` : "--"}</Text>
                        </View>
                    </View>
                )}

                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#493628" />
                        <Text style={styles.loadingText}>Loading Landmarks...</Text>
                    </View>
                )}
            </View>

            {showBottomNav && <WeatherProvider />}
            {showBottomNav && <View style={styles.footerWrapper}><BottomFooter active="Maps" /></View>}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#493628" },
    container: { flex: 1 },
    map: { flex: 1 },
    arrowToggleContainer: { backgroundColor: '#F9F4EF', alignItems: 'center', paddingBottom: 4 },
    arrowToggle: {
        width: 50, height: 20,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#EFEBE9',
        borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
    },
    loadingOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(249, 244, 239, 0.7)',
        justifyContent: 'center', alignItems: 'center', zIndex: 10,
    },
    loadingText: { marginTop: 10, color: '#4E342E', fontSize: 16, fontWeight: '600' },
    footerWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20 },
    // --- UI Styles ---
    leftControls: { position: "absolute", top: 16, left: 16, gap: 10 },
    rightControls: { position: "absolute", top: 16, right: 16, gap: 10 },
    controlButton: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000', shadowOpacity: 0.15,
        shadowRadius: 5, shadowOffset: { width: 0, height: 2 },
    },
    lottieIcon: { width: 40, height: 40 },
    switchContainer: { paddingVertical: 4, height: 'auto', paddingBottom: 0 },
    switchStyle: { transform: [{ scale: 0.8 }] },
    navigationButton: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        elevation: 5,
    },
    navigationButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
    infoPanel: {
        position: "absolute",
        bottom: 160,
        alignSelf: "center",
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        elevation: 5,
        alignItems: 'center',
    },
    infoPanelExpanded: {
        bottom: 20,
    },
    infoItem: { flexDirection: "row", alignItems: "center", gap: 8 },
    infoText: { fontSize: 15, fontWeight: "bold", color: "#4E342E" },
    infoSeparator: { width: 1, height: '60%', backgroundColor: '#D7CCC8', marginHorizontal: 16 },
});