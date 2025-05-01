import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    Platform,
    ActivityIndicator,

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

import { Feather } from "@expo/vector-icons";
import BottomFooter from "../components/BottomFooter";
import Mapbox, { Camera, LocationPuck, MapView, Images, VectorSource } from '@rnmapbox/maps';
import LandmarkMarkers from "../components/LandmarkMarkers";
import LineRoute from "../components/LineRoute";
import { useLandmark } from "../provider/LandmarkProvider";
import LineBoundary from "../components/LineBoundary";
import * as Location from 'expo-location'
import WeatherProvider from "../provider/WeatherProvider";

const screenWidth = Dimensions.get("window").width;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Maps">;

const categories = [
    {
        label: "Tourist Spots",
        uri: "https://img.icons8.com/ios-filled/100/9c8061/monument.png",
    },
    {
        label: "Restaurants",
        uri: "https://img.icons8.com/ios-filled/100/9c8061/restaurant.png",
    },
    {
        label: "Museums",
        uri: "https://img.icons8.com/ios-filled/100/9c8061/museum.png",
    },
    {
        label: "Schools",
        uri: "https://img.icons8.com/ios-filled/100/9c8061/classroom.png",
    },
    {
        label: "Churches",
        uri: "https://img.icons8.com/ios-filled/100/9c8061/church.png",
    },
    {
        label: "Restrooms",
        uri: "https://img.icons8.com/ios-filled/100/9c8061/toilet.png",
    },

    {
        label: "Shops",
        uri: "https://img.icons8.com/ios-filled/100/9c8061/shop.png",
    },
];
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY)
export default function MapsScreen() {

    const navigation = useNavigation<NavigationProp>();
    const scale = useSharedValue(1);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [showCategories, setShowCategories] = useState(true);
    const [showBottomNav, setShowBottomNav] = useState(true);

   

    const pinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
        onActive: (event) => {
            scale.value = event.scale;
        },
        onEnd: () => {
            scale.value = withTiming(1);
        },
    });
    const { duration, distance, showDirection, directionCoordinates} = useLandmark();
   
    console.log("Route Time: ", duration, "Distance:", distance);

    const [coords, setCoords] = useState<[number, number]>([0, 0]);



    useEffect(() => {
        const getLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === "granted") {
                const location = await Location.getCurrentPositionAsync({});
                console.log("User's location: ", location);
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
                <View style={styles.categoryContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {categories.map((cat, index) => {
                            const isSelected = selectedIndex === index;
                            const iconUri = cat.uri.replace("9c8061", isSelected ? "D6C0B3" : "9c8061");

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.category}
                                    onPress={() => setSelectedIndex(index)}
                                >
                                    <Image source={{ uri: iconUri }} style={styles.icon} />
                                    <Text style={[styles.label, isSelected && styles.selectedLabel]}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            <View style={styles.arrowToggle}>
                <TouchableOpacity onPress={() => {
                    setShowCategories(!showCategories); setShowBottomNav(!showBottomNav);

                }}>

                    <Feather
                        name={showCategories ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#ffffff"
                    />
                </TouchableOpacity>

            </View>



            {/* Map */}
            <View style={styles.container}>
                <MapView style={styles.map} styleURL="mapbox://styles/ryanchico/cm93s4vxv003u01r9g2w28ek7" rotateEnabled >
                    <Camera zoomLevel={15} centerCoordinate={[120.97542723276051, 14.591293316236834]} pitch={60} maxBounds={{
                        ne: [120.98057084428427, 14.599918973377212],
                        sw: [120.96574001513486, 14.576564367241561],

                    }} />

                    <LocationPuck puckBearingEnabled={true} puckBearing="heading" pulsing={{ isEnabled: true }} androidRenderMode="gps"
                    />
                    <LineBoundary />
                    <LandmarkMarkers />
                    
                    {showDirection && directionCoordinates && (
                        <LineRoute coordinates={directionCoordinates} />
                    )}
                </MapView>
                <WeatherProvider />
            </View>
      
            {showBottomNav && <BottomFooter active="Maps" />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    map: {
        height: "100%",
        width: "100%"
    },
    puck: {
        width: 50,
        height: 50
    },
    safeArea: {
        flex: 1,
        backgroundColor: "#493628",
    },

    categoryContainer: {
        flexDirection: "column",
        backgroundColor: "#493628",
        alignItems: "center"

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
  


});
