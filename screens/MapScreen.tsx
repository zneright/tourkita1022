import React, { useState } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation/types";
import { PinchGestureHandler, PinchGestureHandlerGestureEvent } from "react-native-gesture-handler";
import Animated, {
    useSharedValue,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import TopHeader from "../components/TopHeader";
import { AntDesign } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import BottomFooter from "../components/BottomFooter";


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
];

export default function MapsScreen() {
    const navigation = useNavigation<NavigationProp>();
    const scale = useSharedValue(1);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [showCategories, setShowCategories] = useState(true);

    const pinchHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
        onActive: (event) => {
            scale.value = event.scale;
        },
        onEnd: () => {
            scale.value = withTiming(1);
        },
    });

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
                <TouchableOpacity onPress={() => setShowCategories(!showCategories)}>
                    <Feather
                        name={showCategories ? "chevron-up" : "chevron-down"}
                        size={24}
                        color="#493628"
                    />
                </TouchableOpacity>
            </View>

            {/* Map */}
            <ScrollView contentContainerStyle={styles.mapScroll}>
                <PinchGestureHandler onGestureEvent={pinchHandler}>
                    <Animated.View style={[styles.mapWrapper, animatedStyle]}>
                        <Image
                            source={{
                                uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/VDRo2IU0ne/y7gokhg4_expires_30_days.png",
                            }}
                            style={styles.mapImage}
                            resizeMode="cover"
                        />
                    </Animated.View>
                </PinchGestureHandler>
            </ScrollView>
            <BottomFooter active="Maps" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    categoryContainer: {
        backgroundColor: "#493628",
        paddingVertical: 12,
        paddingLeft: 10,
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
    mapScroll: {
        alignItems: "center",
        paddingBottom: 30,
    },
    mapWrapper: {
        marginTop: 10,
        borderRadius: 30,
        overflow: "hidden",
    },
    mapImage: {
        width: screenWidth - 40,
        height: 600,
        borderRadius: 30,
    },
});
