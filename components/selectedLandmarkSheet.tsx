import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useRef } from "react";
import { Text, Image, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLandmark } from "../provider/LandmarkProvider";

import Entypo from '@expo/vector-icons/Entypo';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SelectedLandmarkSheet() {
    const { selectedLandmark, duration, distance, loadingDirection, loadDirection } = useLandmark();
    const bottomSheetRef = useRef<BottomSheet>(null);

    useEffect(() => {
        if (selectedLandmark) {
            bottomSheetRef.current?.expand();
        }
    }, [selectedLandmark]);

    const handleGetDirection = () => {
        loadDirection();
    };

    if (!selectedLandmark) return null;

    const today = new Date();
    const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = today.getHours() * 60 + today.getMinutes();

    const isOpenToday = () => {
        const hoursToday = selectedLandmark.openingHours[dayOfWeek];
        if (!hoursToday || hoursToday.closed) return false;

        const openTime = hoursToday.open ? hoursToday.open.split(":").map((x: string) => parseInt(x)) : null;
        const closeTime = hoursToday.close ? hoursToday.close.split(":").map((x: string) => parseInt(x)) : null;

        if (!openTime || !closeTime) return false;

        const openMinutes = openTime[0] * 60 + openTime[1];
        const closeMinutes = closeTime[0] * 60 + closeTime[1];

        return currentTime >= openMinutes && currentTime <= closeMinutes;
    };

    const convertTo12HourFormat = (time24: string | undefined) => {
        if (!time24) return "";

        const [hours, minutes] = time24.split(":").map((x) => parseInt(x));

        const period = hours >= 12 ? "PM" : "AM";
        const hours12 = hours % 12 || 12;
        const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;

        return `${hours12}:${minutesFormatted} ${period}`;
    };

    const statusIcon = isOpenToday() ? (
        <Ionicons name="checkmark-circle" size={20} color="green" />
    ) : (
        <Ionicons name="close-circle" size={20} color="red" />
    );

    const statusText = isOpenToday() ? "Open" : "Closed";

    return (
        <BottomSheet
            backgroundStyle={{ backgroundColor: "#D6C0B3" }}
            ref={bottomSheetRef}
            index={-1}
            enableDynamicSizing
            enablePanDownToClose
        >
            <BottomSheetView style={{ padding: 15 }}>
                <View style={{ flexDirection: "column", gap: 15 }}>

                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={{ color: "#6B5E5E", fontWeight: "bold" }}>AR Camera Supported</Text>

                        <View style={{ flexDirection: "row", gap: 20 }}>
                            <View style={{ flexDirection: "row", gap: 5 }}>
                                <FontAwesome5 name="route" size={15} color="black" />
                                {loadingDirection ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text>{(duration / 1000).toFixed(2)} km</Text>
                                )}
                            </View>
                            <View style={{ flexDirection: "row", gap: 5 }}>
                                <Entypo name="back-in-time" size={18} color="black" />
                                {loadingDirection ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text>{(distance / 60).toFixed(0)} min</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 15 }}>
                        <Image
                            source={{ uri: selectedLandmark.image }}
                            style={{ height: 110, width: 175, borderRadius: 10 }}
                        />

                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 5 }}>{selectedLandmark.name}</Text>

                            <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
                                <Entypo name="location-pin" size={20} color="black" />
                                <Text style={{ fontSize: 15 }}>{selectedLandmark.address}</Text>
                            </View>

                            <View style={{ flexDirection: "row", gap: 5, marginTop: 5 }}>
                                {statusIcon}
                                <Text>{statusText}</Text>
                            </View>

                            <View style={{ flexDirection: "row", gap: 5, marginTop: 5 }}>
                                <Fontisto name="ticket" size={20} color="black" />
                                <Text>Entrance is P{selectedLandmark.entranceFee}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Opening Hours */}
                    {selectedLandmark.openingHours && (
                        <View style={{ marginTop: 10 }}>
                            <Text style={{ fontWeight: "bold", fontSize: 15 }}>Opening Hours</Text>
                            {Object.keys(selectedLandmark.openingHours).map((day: string) => {
                                const dayData = selectedLandmark.openingHours[day];
                                const openingStatus = dayData.closed
                                    ? "Closed"
                                    : `Open from ${convertTo12HourFormat(dayData.open)} to ${convertTo12HourFormat(dayData.close)}`;
                                const isClosed = dayData.closed;

                                return (
                                    <Text
                                        key={day}
                                        style={{
                                            color: isClosed && day !== dayOfWeek ? "red" : "#6B5E5E",
                                            textAlign: "justify",
                                            marginTop: 5,
                                            fontSize: 14
                                        }}
                                    >
                                        {`${day.charAt(0).toUpperCase() + day.slice(1)}: ${openingStatus}`}
                                    </Text>
                                );
                            })}
                        </View>
                    )}

                    {/* Description */}
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ fontWeight: "bold", fontSize: 15 }}>Description</Text>
                        <Text style={{ color: "#6B5E5E", textAlign: "justify", marginTop: 5 }}>
                            {selectedLandmark.description}
                        </Text>
                    </View>

                    {/* Learn More Button */}
                    <TouchableOpacity>
                        <View style={{ flexDirection: "row", gap: 5, marginTop: 10 }}>
                            <Text style={{ fontWeight: "bold" }}>Learn More</Text>
                            <Entypo name="arrow-bold-right" size={18} color="black" />
                        </View>
                    </TouchableOpacity>

                    {/* Get Direction Button */}
                    <TouchableOpacity onPress={handleGetDirection} disabled={loadingDirection}>
                        <View
                            style={{
                                width: "75%",
                                height: 50,
                                backgroundColor: "#6B5E5E",
                                borderRadius: 15,
                                alignSelf: "center",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "row",
                                gap: 10,
                                marginTop: 20,
                            }}
                        >
                            {loadingDirection ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Entypo name="direction" size={24} color="white" />
                                    <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>Get Direction</Text>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </BottomSheetView>
        </BottomSheet>
    );
}
