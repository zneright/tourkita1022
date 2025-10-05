import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet
} from "react-native";

import Animated, {
    useSharedValue,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    withTiming,

} from "react-native-reanimated";

const WeatherProvider = () => {

    const [isLoading, setLoading] = useState(true);
    const [response, setResponse] = useState();

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
    return (


        <View style={styles.weatherButton}>
            <TouchableOpacity

                onPress={() => {
                    const isShowing = !showWeatherInfo;
                    setShowWeatherInfo(isShowing);

                    weatherInfoTranslateX.value = withTiming(isShowing ? 0 : 100, { duration: 500 });
                    weatherInfoWidth.value = withTiming(isShowing ? 330 : 0, { duration: 500 });
                    weatherInfoHeight.value = withTiming(isShowing ? 450 : 0, { duration: 500 });
                }}>
                <LottieView
                    source={require("../assets/animations/day.json")}
                    autoPlay
                    loop
                    style={{ width: 90, height: 80 }}
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

    )
}
const styles = StyleSheet.create({
    weatherButton: {
        zIndex: 10,
        position: "absolute",
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        opacity: 0.9,
        elevation: 10,
        top: 20,
        right: 20,
        borderRadius: 35,

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
})
export default WeatherProvider
