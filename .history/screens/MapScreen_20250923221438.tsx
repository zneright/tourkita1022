import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Button,
    Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation/types";
import { PinchGestureHandlerGestureEvent } from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import TopHeader from "../components/TopHeader";
import { Entypo, Feather, FontAwesome5 } from "@expo/vector-icons";
import BottomFooter from "../components/BottomFooter";
import Mapbox, { Camera, LocationPuck, MapView, } from '@rnmapbox/maps';
import LandmarkMarkers from "../components/LandmarkMarkers";
import LineRoute from "../components/LineRoute";
import { useLandmark } from "../provider/LandmarkProvider";
import LineBoundary from "../components/LineBoundary";
import * as Location from 'expo-location';
import WeatherProvider from "../provider/WeatherProvider";
import CategoryFilter from "../components/CategoryFilter";
import { set } from "date-fns";
import { useRoute } from "@react-navigation/native";


const screenWidth = Dimensions.get("window").width;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Maps">;


Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || "");

export default function MapsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const scale = useSharedValue(1);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [showCategories, setShowCategories] = useState(true);
    const [showBottomNav, setShowBottomNav] = useState(true);
    const [currentMap, setCurrentMap] = useState("mapbox://styles/ryanchico/cm93s4vxv003u01r9g2w28ek7")
    const route = useRoute<any>();
    const [selectedCategory, setSelectedCategory] = useState<string>(
        route.params?.category || "All"
    );

    const [isLoading, setIsLoading] = useState(false);
    const [visible, setVisible] = useState(true)
    const [showUpdate, setShowUpdate] = useState(true);

    const pinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
        onActive: (event) => {
            scale.value = event.scale;
        },
        onEnd: () => {
            scale.value = withTiming(1);
        },
    });
    useEffect(() => {
        if (route.params?.category) {
            setSelectedCategory(route.params.category);
        }
    }, [route.params?.category]);

    const { duration, distance, showDirection, directionCoordinates, } = useLandmark();

    const [coords, setCoords] = useState<[number, number]>([0, 0]);

    useEffect(() => {
        const getLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === "granted") {
                const location = await Location.getCurrentPositionAsync({});
                setCoords([location.coords.longitude, location.coords.latitude]);
            } else {
                console.log("Location permission not granted.");
            }
        };
        getLocation();
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar backgroundColor="#493628" barStyle="light-content" />
            <TopHeader title="Maps" onSupportPress={() => navigation.navigate("Support")} />

            {showCategories && (
                <CategoryFilter
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />
            )}

            <View style={styles.arrowToggle}>
                <TouchableOpacity
                    onPress={() => {
                        setShowCategories(!showCategories);
                        setShowBottomNav(!showBottomNav);
                        setShowUpdate(!showUpdate);
                    }}
                >
                    <Feather
                        name={showCategories ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#ffffff"
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        styleURL={currentMap}
                        rotateEnabled
                    >

                        <Camera
                            zoomLevel={15}
                            centerCoordinate={[120.97542723276051, 14.591293316236834]}
                            pitch={60}
                            maxBounds={{
                                ne: [120.98057084428427, 14.599918973377212],
                                sw: [120.96574001513486, 14.576564367241561],
                            }}
                        />
                        <LocationPuck
                            puckBearingEnabled={true}
                            puckBearing="heading"
                            pulsing={{ isEnabled: true }}
                            androidRenderMode="gps"
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

                        <TouchableOpacity
                            onPress={() => setVisible(!visible)}
                            style={{
                                position: "absolute",
                                top: 40,
                                left: 20,
                                backgroundColor: visible ? "#EF4444" : "#22C55E",
                                paddingHorizontal: 16,
                                paddingVertical: 10,
                                borderRadius: 8,
                            }}
                        >
                            <Text style={{ color: "white", fontWeight: "bold" }}>
                                {visible ? "Hide" : "Show"}
                            </Text>
                        </TouchableOpacity>
                    )}
                    <View
                        style={{
                            position: "absolute",
                            bottom: 70,
                            right: 20,
                            backgroundColor: "white",
                            padding: 10,
                            borderRadius: 8,
                            flexDirection: "row",
                            alignItems: "center",
                            elevation: 4,
                        }}
                    >
                        {showBottomNav && (
                            <View style={{ alignItems: "center" }}>

                                <Text style={{ marginRight: 8, fontWeight: "600", }}>
                                    {currentMap === "mapbox://styles/ryanchico/cm93s4vxv003u01r9g2w28ek7" ? "Map" : "Satellite"}
                                </Text>
                                <Switch

                                    value={currentMap === "mapbox://styles/ryanchico/cm93s4vxv003u01r9g2w28ek7"}
                                    onValueChange={(val) => {
                                        setCurrentMap(
                                            val
                                                ? "mapbox://styles/ryanchico/cm93s4vxv003u01r9g2w28ek7"
                                                : "mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y"
                                        );
                                    }}
                                    trackColor={{ false: "#d1d5db", true: "#22c55e" }}
                                    thumbColor={currentMap === "mapbox://styles/ryanchico/cm93s4vxv003u01r9g2w28ek7" ? "#16a34a" : "#f4f3f4"}
                                />
                            </View>
                        )}
                    </View>

                    {showBottomNav && (
                        <View style={styles.infoPanel}>
                            <View style={styles.infoItem}>
                                <FontAwesome5 name="route" size={16} color="#333" />
                                <Text style={styles.infoText}>
                                    {distance != null ? (distance / 1000).toFixed(2) : "--"} km
                                </Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Entypo name="back-in-time" size={16} color="#333" />
                                <Text style={styles.infoText}>
                                    {duration != null ? (duration / 60).toFixed(0) : "--"} min
                                </Text>
                            </View>
                        </View>

                    )}
                    <View style={styles.infoPanel2}>
                        <View style={styles.infoItem}>
                            <FontAwesome5 name="route" size={16} color="#333" />
                            <Text style={styles.infoText2}>
                                {distance != null ? (distance / 1000).toFixed(2) : "--"} km
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Entypo name="back-in-time" size={16} color="#333" />
                            <Text style={styles.infoText2}>
                                {duration != null ? (duration / 60).toFixed(0) : "--"} min
                            </Text>
                        </View>
                    </View>

                    {isLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#493628" />
                            <Text style={styles.loadingText}>Loading landmarks...</Text>
                        </View>
                    )}
                </View>
                {showBottomNav && (
                    <WeatherProvider />
                )}

            </View>
            {showBottomNav && (
                <View style={styles.footerWrapper}>
                    <BottomFooter active="Maps" />
                </View>
            )}

        </SafeAreaView>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    footerWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
    },

    map: {
        height: "100%",
        width: "100%",
    },
    puck: {
        width: 50,
        height: 50,
    },
    safeArea: {
        flex: 1,
        backgroundColor: "#493628",
    },
    categoryContainer: {
        flexDirection: "column",
        backgroundColor: "#493628",
        alignItems: "center",
    },
    category: {
        alignItems: "center",
        marginRight: 20,
    },
    icon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginBottom: 6,
    },
    label: {
        color: "#9c8061",
        fontSize: 12,
        fontWeight: "600",
    },
    selectedLabel: {
        color: "#D6C0B3",
    },
    arrowToggle: {
        alignItems: "center",
        marginVertical: 6,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },

    loadingText: {
        marginTop: 10,
        color: '#000',
        fontSize: 16,
    }, infoPanel: {
        position: "absolute",
        bottom: 75,
        alignSelf: "center",
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        elevation: 5,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        gap: 12,
    },
    infoPanel2: {
        position: "absolute",
        bottom: 20,
        alignSelf: "center",
        flexDirection: "row",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        elevation: 5,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        gap: 12,
    },
    infoItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    infoText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    infoText2: {
        fontSize: 24,
        fontWeight: "600",
        color: "#333",
    },



});
