import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const WeatherProvider = () => {
    const [isLoading, setLoading] = useState(true);
    const [response, setResponse] = useState<any>();
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

    useEffect(() => {
        fetch(
            "https://api.weatherapi.com/v1/forecast.json?key=5187868995f64f229f565521252604&q=Intramuros"
        )
            .then((res) => res.json())
            .then(
                (result) => {
                    setLoading(false);
                    setResponse(result);
                },
                (error) => {
                    setLoading(false);
                    console.log("Error fetching api ", error);
                }
            );
    }, []);

    return (
        <View style={styles.weatherButton}>
            <TouchableOpacity
                onPress={() => {
                    const isShowing = !showWeatherInfo;
                    setShowWeatherInfo(isShowing);

                    weatherInfoTranslateX.value = withTiming(isShowing ? 0 : 100, {
                        duration: 500,
                    });
                    weatherInfoWidth.value = withTiming(width * 0.85, { duration: 500 });
                    weatherInfoHeight.value = withTiming(isShowing ? 480 : 0, {
                        duration: 500,
                    });
                }}
            >
                <Image
                    source={require("../assets/sunny.png")}
                    style={styles.weatherIcon}
                />
            </TouchableOpacity>

            <Animated.View style={[styles.weatherInfo, animatedWeatherStyle]}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#D9B44A" />
                ) : (
                    <>
                        <Text style={styles.locationText}>
                            {response?.location?.name}, Manila
                        </Text>

                        <View style={styles.currentWeather}>
                            <Text style={styles.tempText}>{response?.current?.temp_c}°C</Text>
                            <Text style={styles.conditionText}>
                                {response?.current?.condition?.text}
                            </Text>
                        </View>

                        <Text style={styles.forecastTitle}>Hourly Forecast</Text>

                        <View style={{ width: '100%' }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.hourlyScroll}
                            >
                                {response?.forecast?.forecastday[0]?.hour.slice(1).map(
                                    (hourData: any, index: number) => {
                                        const date = new Date(hourData.time);
                                        let hour = date.getHours();
                                        const ampm = hour >= 12 ? "PM" : "AM";
                                        hour = hour % 12;
                                        hour = hour === 0 ? 12 : hour;

                                        return (
                                            <View key={index} style={styles.hourCard}>
                                                <Text style={styles.hourText}>
                                                    {hour}
                                                    {ampm}
                                                </Text>
                                                <Image
                                                    source={{ uri: "https:" + hourData.condition.icon }}
                                                    style={styles.hourIcon}
                                                />
                                                <Text style={styles.hourTemp}>{hourData.temp_c}°C</Text>
                                            </View>
                                        );
                                    }
                                )}
                            </ScrollView>
                        </View>
                    </>
                )}
            </Animated.View>

        </View>
    );
};

const styles = StyleSheet.create({
    weatherButton: {
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 10,
    },
    weatherIcon: {
        width: 60,
        height: 60,
        resizeMode: "contain",
        borderRadius: 30,
        backgroundColor: "#FFF8E7", // TourKita light cream
        padding: 10,
        elevation: 5,
    },
    weatherInfo: {
        position: "absolute",
        
        top: 80,
        right: 0,
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 15,
        elevation: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 10,
        gap: 20,
        overflow: "visible",
        backgroundColor: "#FFF8E7",
    },

    locationText: {
        fontWeight: "bold",
        fontSize: 26,
        color: "#4B3B2A", // dark brown
    },
    currentWeather: {
        alignItems: "center",
    },
    tempText: {
        fontSize: 52,
        fontWeight: "bold",
        color: "#D9B44A", // golden accent
    },
    conditionText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#7D5A50", // medium brown
    },
    forecastTitle: {
        fontWeight: "bold",
        fontSize: 20,
        alignSelf: "flex-start",
        marginBottom: 10,
        color: "#4B3B2A",
    },
    hourlyScroll: {
        paddingVertical: 10,
        paddingLeft: 5,
    },
    hourCard: {
        backgroundColor: "#F0E3C2", // light warm brown
        padding: 12,
        borderRadius: 15,
        marginRight: 10,
        alignItems: "center",
        width: 80,
    },
    hourText: {
        fontWeight: "600",
        marginBottom: 5,
        color: "#7D5A50",
    },
    hourIcon: {
        width: 40,
        height: 40,
        marginBottom: 5,
    },
    hourTemp: {
        fontWeight: "bold",
        color: "#D9B44A",
    },
});

export default WeatherProvider;
