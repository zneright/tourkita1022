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

    const [showWeatherInfo, setShowWeatherInfo] = useState(false);
    const weatherInfoTranslateX = useSharedValue(100);
    const weatherInfoWidth = useSharedValue(0);
    const weatherInfoHeight = useSharedValue(0);
    const animatedWeatherStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: weatherInfoTranslateX.value }],
        width: weatherInfoWidth.value,
        height: weatherInfoHeight.value,
        opacity: weatherInfoHeight.value === 0 ? 0 : 1,
    }));


    const pinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
        onActive: (event) => {
            scale.value = event.scale;
        },
        onEnd: () => {
            scale.value = withTiming(1);
        },
    });
    const { directionCoordinates, duration, distance } = useLandmark();
    const [isLoading, setLoading] = useState(true);
    const [response, setResponse] = useState();
    console.log("Route Time: ", duration, "Distance:", distance);

    const [coords, setCoords] = useState<[number, number]>([0, 0]);


    useEffect(() => {
        fetch("https://api.weatherapi.com/v1/forecast.json?key=5187868995f64f229f565521252604&q=Intramuros")
            .then(res => res.json())
            .then((result) => {
                setLoading(false);
                setResponse(result);

            },
                (error) => {
                    setLoading(false);
                    console.log("Error fetching api ", error)
                }
            )
    }, [])


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

                    {directionCoordinates && (
                        <LineRoute coordinates={directionCoordinates} />)}

                </MapView>
                <View style={styles.weatherButton}>
                    <TouchableOpacity

                        onPress={() => {
                            const isShowing = !showWeatherInfo;
                            setShowWeatherInfo(isShowing);

                            weatherInfoTranslateX.value = withTiming(isShowing ? 0 : 100, { duration: 500 });
                            weatherInfoWidth.value = withTiming(isShowing ? 330 : 0, { duration: 500 });
                            weatherInfoHeight.value = withTiming(isShowing ? 450 : 0, { duration: 500 });
                        }}>
                        <Image
                            source={require('../assets/sunny.png')}
                            style={styles.weatherIcon}

                        />
                    </TouchableOpacity>
                    <Animated.View style={[styles.weatherInfo, animatedWeatherStyle]}>
                        {isLoading ? (
                            <ActivityIndicator size="large" />
                        ) : (
                            <>
                                <Text style={{ fontWeight: "bold", fontSize: 28 }}>
                                    {response?.location?.name}, Manila
                                </Text>
                                <View style={{
                                    alignItems: "center"
                                }}>

                                    <Text style={{ fontWeight: "bold", fontSize: 50 }}>
                                        {response?.current?.temp_c}°C
                                    </Text>
                                    <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                                        {response?.current?.condition?.text}
                                    </Text>
                                </View>
                                <Text style={{
                                    fontWeight: "bold",
                                    fontSize: 20
                                }}>Hourly Forecast</Text>
                                <ScrollView style={{ width: "80%" }}>
                                    {response?.forecast?.forecastday[0]?.hour.slice(1).map((hourData, index) => {
                                        const date = new Date(hourData.time);
                                        let hour = date.getHours();
                                        const ampm = hour >= 12 ? 'PM' : 'AM';
                                        hour = hour % 12;
                                        hour = hour === 0 ? 12 : hour;
                                        return (
                                            <View
                                                key={index}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    marginBottom: 8,
                                                    backgroundColor: "rgba(255, 255, 255, 0.4)",
                                                    padding: 10,
                                                    borderRadius: 10,
                                                    justifyContent: "space-around"
                                                }}
                                            >
                                                <Text style={{ fontWeight: "bold", width: 50 }}>
                                                    {hour}{ampm}
                                                </Text>
                                                <Image
                                                    source={{ uri: "https:" + hourData.condition.icon }}
                                                    style={{ width: 30, height: 40, marginRight: 10 }}
                                                />
                                                <Text style={{ fontSize: 16, fontWeight: "bold" }}>  {hourData.temp_f}F / {hourData.temp_c}°C </Text>
                                            </View>
                                        );
                                    })}
                                </ScrollView>
                            </>

                        )}
                    </Animated.View>


                </View>
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
    weatherButton: {
        zIndex: 10,
        position: "absolute",
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        opacity: 0.9,
        elevation: 10,
        top: 20,
        right: 20,
        borderRadius: 35,
        padding: 10,
    },
    weatherIcon: {
        width: 50,
        height: 50,
        resizeMode: "contain"
    },
    weatherInfo: {
        alignItems: "center",
        gap: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },


});
