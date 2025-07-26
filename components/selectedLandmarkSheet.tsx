import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState, useMemo } from "react";
import {
    Text,
    Image,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
} from "react-native";
import { useLandmark } from "../provider/LandmarkProvider";

import Entypo from "@expo/vector-icons/Entypo";
import Fontisto from "@expo/vector-icons/Fontisto";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";

import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function SelectedLandmarkSheet() {
    const [isImageModalVisible, setImageModalVisible] = useState(false);

    const { selectedLandmark, duration, distance, loadingDirection, loadDirection } = useLandmark();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["50%", "90%"], []);
    const [averageRating, setAverageRating] = useState<number | null>(null);
    const [reviewCount, setReviewCount] = useState<number>(0);


    useEffect(() => {
        if (selectedLandmark) {
            bottomSheetRef.current?.expand();
            fetchAverageRating();
            loadDirection();
        }
    }, [selectedLandmark]);

    const fetchAverageRating = async () => {
        if (!selectedLandmark) return;
        try {
            const q = query(
                collection(db, "feedbacks"),
                where("location", "==", selectedLandmark.name)
            );
            const querySnapshot = await getDocs(q);
            const ratings: number[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (typeof data.rating === "number") {
                    ratings.push(data.rating);
                }
            });

            if (ratings.length > 0) {
                const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
                setAverageRating(Number(avg.toFixed(1)));
                setReviewCount(ratings.length);
            } else {
                setAverageRating(null);
                setReviewCount(0);
            }
        } catch (error) {
            console.error("Error fetching average rating:", error);
            setAverageRating(null);
            setReviewCount(0);
        }
    };

    const handleGetDirection = () => {
        loadDirection();
    };

    if (!selectedLandmark) return null;

    const today = new Date();
    const dayOfWeek = today.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
    const currentTime = today.getHours() * 60 + today.getMinutes();

    const isOpenToday = () => {
        const hoursToday = selectedLandmark.openingHours[dayOfWeek];
        if (!hoursToday || hoursToday.closed) return false;

        const openTime = hoursToday.open?.split(":").map(Number);
        const closeTime = hoursToday.close?.split(":").map(Number);

        if (!openTime || !closeTime) return false;

        const openMinutes = openTime[0] * 60 + openTime[1];
        const closeMinutes = closeTime[0] * 60 + closeTime[1];

        return currentTime >= openMinutes && currentTime <= closeMinutes;
    };

    const convertTo12HourFormat = (time24: string | undefined) => {
        if (!time24) return "";
        const [hours, minutes] = time24.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes < 10 ? "0" : ""}${minutes} ${period}`;
    };

    const statusIcon = isOpenToday() ? (
        <Ionicons name="checkmark-circle" size={18} color="green" />
    ) : (
        <Ionicons name="close-circle" size={18} color="red" />
    );
    const statusText = isOpenToday() ? "Open" : "Closed";

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            backgroundStyle={styles.sheetBackground}
        >
            <BottomSheetScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.topRow}>
                    <Text style={styles.arSupportText}>
                        {selectedLandmark.arCameraSupported ? "AR Camera Supported" : "No AR Support"}
                    </Text>
                    <View style={styles.topRowInfo}>
                        <View style={styles.iconTextRow}>
                            <FontAwesome5 name="route" size={14} color="black" />
                            {loadingDirection ? (
                                <ActivityIndicator size="small" />
                            ) : (
                                <Text>{(duration / 1000).toFixed(2)} km</Text>
                            )}
                        </View>
                        <View style={styles.iconTextRow}>
                            <Entypo name="back-in-time" size={16} color="black" />
                            {loadingDirection ? (
                                <ActivityIndicator size="small" />
                            ) : (
                                <Text>{(distance / 60).toFixed(0)} min</Text>
                            )}
                        </View>
                    </View>
                </View>

                <View style={styles.infoRow}>
                    <TouchableOpacity onPress={() => setImageModalVisible(true)}>
                        <Image
                            source={{ uri: selectedLandmark.image }}
                            style={styles.image}
                        />
                    </TouchableOpacity>
                    <View style={styles.detailsContainer}>
                        <Text style={styles.name}>{selectedLandmark.name}</Text>
                        <View style={styles.locationRow}>
                            <Entypo name="location-pin" size={18} />
                            <Text>{selectedLandmark.address}</Text>
                        </View>
                        <View style={styles.statusRow}>
                            {statusIcon}
                            <Text>{statusText}</Text>
                        </View>
                        <View style={styles.statusRow}>
                            <Fontisto name="ticket" size={16} />
                            <Text>
                                Entrance:{" "}
                                {selectedLandmark.entranceFee && Number(selectedLandmark.entranceFee) > 0
                                    ? `₱${selectedLandmark.entranceFee}`
                                    : "Free"}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Opening Hours</Text>
                    {(() => {
                        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
                        const formatDay = (d: string) => d.charAt(0).toUpperCase() + d.slice(1);
                        const getHours = (d: string) => {
                            const dayData = selectedLandmark.openingHours[d];
                            return !dayData || dayData.closed
                                ? "Closed"
                                : `Open from ${convertTo12HourFormat(dayData.open)} to ${convertTo12HourFormat(dayData.close)}`;
                        };

                        const grouped: { days: string[]; hours: string }[] = [];
                        let currentGroup: { days: string[]; hours: string } | null = null;

                        days.forEach((day) => {
                            const hours = getHours(day);
                            if (!currentGroup) {
                                currentGroup = { days: [day], hours };
                            } else if (currentGroup.hours === hours) {
                                currentGroup.days.push(day);
                            } else {
                                grouped.push(currentGroup);
                                currentGroup = { days: [day], hours };
                            }
                        });
                        if (currentGroup) grouped.push(currentGroup);

                        return grouped.map(({ days, hours }, i) => {
                            const label =
                                days.length === 1
                                    ? formatDay(days[0])
                                    : `${formatDay(days[0])} - ${formatDay(days[days.length - 1])}`;
                            return (
                                <Text key={i} style={[styles.hoursText, hours === "Closed" && styles.closedText]}>
                                    {label}: {hours}
                                </Text>
                            );
                        });
                    })()}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{selectedLandmark.description}</Text>
                </View>

                {averageRating !== null && (
                    <View style={styles.ratingRow}>
                        <FontAwesome5 name="star" size={16} color="#E4B343" />
                        <Text style={styles.ratingText}>
                            {averageRating} / 5 ({reviewCount} review{reviewCount > 1 ? "s" : ""})
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    onPress={handleGetDirection}
                    disabled={loadingDirection}
                    style={styles.button}
                >
                    {loadingDirection ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Entypo name="direction" size={22} color="white" />
                            <Text style={styles.buttonText}>Get Direction</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Modal visible={isImageModalVisible} transparent>
                    <Pressable style={styles.modal} onPress={() => setImageModalVisible(false)}>
                        <Image
                            source={{ uri: selectedLandmark.image }}
                            style={styles.modalImage}
                        />
                    </Pressable>
                </Modal>
            </BottomSheetScrollView>
        </BottomSheet>
    );
} const styles = StyleSheet.create({
    sheetBackground: {
        backgroundColor: "#F9F4F0",
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 40,
        gap: 10,
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    arSupportText: {
        fontWeight: "600",
        fontSize: 14,
        color: "#6D4C41",
        paddingHorizontal: 5,
    },
    topRowInfo: {
        flexDirection: "row",
        gap: 4,
        flexWrap: "wrap",
        justifyContent: "flex-end",
    },
    iconTextRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: "#EFE1D7",
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 12,
    },

    infoRow: {
        flexDirection: "row",
        gap: 16,
        alignItems: "flex-start",
    },
    image: {
        width: 160,
        height: 150,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "#D7CCC8",
        backgroundColor: "#F3EDEB",
    },

    detailsContainer: {
        flex: 1,
        justifyContent: "space-between",
        gap: 6,
    },
    name: {
        fontSize: 20,
        fontWeight: "700",
        color: "#4E342E",
        marginBottom: 6,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 2,
    },

    section: {
        backgroundColor: "#FFF9F4",
        padding: 18,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#E6D9CF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },

    sectionTitle: {
        fontWeight: "700",
        fontSize: 18,
        color: "#3E2723",
        marginBottom: 10,
        letterSpacing: 0.4,
    },
    hoursText: {
        fontSize: 14,
        color: "#5D4037",
        paddingVertical: 2,
    },
    closedText: {
        color: "#B71C1C",
        fontWeight: "500",
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        color: "#4E342E",
        textAlign: "justify",
        letterSpacing: 0.3,
    },

    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 8,
        backgroundColor: "#F0E7E1",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E3D6CF",
    },
    ratingText: {
        fontWeight: "600",
        fontSize: 14.5,
        color: "#4E342E",
    },

    button: {
        marginTop: 20,
        backgroundColor: "#6D4C41",
        borderRadius: 28,
        height: 52,
        paddingHorizontal: 28,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        letterSpacing: 0.5,
    },

    modal: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.85)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalImage: {
        width: "90%",
        height: "70%",
        resizeMode: "contain",
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#D7CCC8",
    },
});
