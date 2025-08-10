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
    const [averageRating, setAverageRating] = useState<number | null>(null);
    const [reviewCount, setReviewCount] = useState<number>(0);
    const [eventInProgress, setEventInProgress] = useState(false);

    const { selectedLandmark, duration, distance, loadingDirection, loadDirection } = useLandmark();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ["50%", "90%"], []);
    const [weeklyEvents, setWeeklyEvents] = useState<{ day: string; title: string; start: string; end: string; openToPublic: boolean }[]>([]);


    //  Pag pinindot ang markers
    useEffect(() => {
        if (selectedLandmark) {
            bottomSheetRef.current?.expand();
            fetchAverageRating();
            loadDirection();
            checkEvents();
        }
    }, [selectedLandmark]);
    const parseTimeToMinutes = (t?: string | null) => {
        if (!t) return null;
        const parts = t.split(":").map(Number);
        if (parts.length !== 2 || parts.some(isNaN)) return null;
        return parts[0] * 60 + parts[1];
    };
    //  May event ba?
    const checkEvents = async () => {
        if (!selectedLandmark) return;

        try {
            const idVariants = [selectedLandmark.id, String(selectedLandmark.id)];
            let snapshot = null;

            for (const idVal of idVariants) {
                const q = query(collection(db, "events"), where("locationId", "==", idVal));
                const snap = await getDocs(q);
                if (!snap.empty) { snapshot = snap; break; }
            }

            if (!snapshot || snapshot.empty) {
                setEventInProgress(false);
                setWeeklyEvents([]);
                return;
            }

            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            let inProgress = false;
            let eventsForWeek: { day: string; title: string; start: string; end: string; openToPublic: boolean }[] = [];

            snapshot.forEach(docSnap => {
                const event: any = docSnap.data();

                let eventDate: Date | null = null;
                if (event.date?.toDate) {
                    eventDate = event.date.toDate();
                } else if (typeof event.date === "string") {
                    eventDate = new Date(event.date);
                }

                if (!eventDate || isNaN(eventDate.getTime())) return;

                const dayName = eventDate.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
                eventsForWeek.push({
                    day: dayName,
                    title: event.title || "Untitled Event",
                    start: event.time || "00:00",
                    end: event.endTime || "23:59",
                    openToPublic: event.openToPublic !== false
                });

                const sameDay =
                    eventDate.getFullYear() === now.getFullYear() &&
                    eventDate.getMonth() === now.getMonth() &&
                    eventDate.getDate() === now.getDate();

                if (!sameDay) return;

                const start = parseTimeToMinutes(event.time) ?? 0;
                const end = parseTimeToMinutes(event.endTime) ?? 24 * 60;
                const withinEventTime = end > start
                    ? nowMinutes >= start && nowMinutes < end
                    : nowMinutes >= start || nowMinutes < end;

                if (withinEventTime && event.openToPublic === false) {
                    inProgress = true;
                }
            });

            setWeeklyEvents(eventsForWeek);
            setEventInProgress(inProgress);

        } catch (err) {
            console.error("checkEvents error:", err);
            setEventInProgress(false);
            setWeeklyEvents([]);
        }
    };

    const fetchAverageRating = async () => {
        if (!selectedLandmark) return;
        try {
            const q = query(collection(db, "feedbacks"), where("location", "==", selectedLandmark.name));
            const querySnapshot = await getDocs(q);
            const ratings: number[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (typeof data.rating === "number") ratings.push(data.rating);
            });
            if (ratings.length > 0) {
                const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
                setAverageRating(Number(avg.toFixed(1)));
                setReviewCount(ratings.length);
            } else {
                setAverageRating(null);
                setReviewCount(0);
            }
        } catch {
            setAverageRating(null);
            setReviewCount(0);
        }
    };

    const handleGetDirection = () => loadDirection();

    if (!selectedLandmark) return null;

    // Checking of time and date now na!
    const today = new Date();
    const dayOfWeek = today.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
    const currentTime = today.getHours() * 60 + today.getMinutes();

    //  bukas ba?
    const isOpenToday = () => {
        if (eventInProgress) return false;
        const hoursToday = selectedLandmark?.openingHours?.[dayOfWeek];
        if (!hoursToday || hoursToday.closed) return false;
        const parseTime = (t?: string) => {
            if (!t) return null;
            const [h, m] = t.split(":").map(Number);
            return isNaN(h) || isNaN(m) ? null : h * 60 + m;
        };
        const openMinutes = parseTime(hoursToday.open);
        const closeMinutes = parseTime(hoursToday.close);
        if (openMinutes == null || closeMinutes == null) return false;
        const withinHours =
            closeMinutes > openMinutes
                ? currentTime >= openMinutes && currentTime < closeMinutes
                : currentTime >= openMinutes || currentTime < closeMinutes;
        if (selectedLandmark.isPublicEvent === false && withinHours) return false;
        return withinHours;
    };

    const convertTo12HourFormat = (time24: string | undefined) => {
        if (!time24) return "";
        const [h, m] = time24.split(":").map(Number);
        const period = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12}:${m < 10 ? "0" : ""}${m} ${period}`;
    };
    const openStatus = isOpenToday();

    const statusIcon = openStatus
        ? <Ionicons name="checkmark-circle" size={18} color="green" />
        : <Ionicons name="close-circle" size={18} color="red" />;

    const statusText = openStatus
        ? "Open"
        : eventInProgress
            ? "Closed for Private Event"
            : "Closed";



    return (
        <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={snapPoints} enablePanDownToClose backgroundStyle={styles.sheetBackground}>
            <BottomSheetScrollView contentContainerStyle={styles.scrollContainer}>
                {/*  Header info */}
                <View style={styles.topRow}>
                    <Text style={styles.arSupportText}>
                        {selectedLandmark.arCameraSupported ? "AR Camera Supported" : "No AR Support"}
                    </Text>
                    <View style={styles.topRowInfo}>
                        <View style={styles.iconTextRow}>
                            <FontAwesome5 name="route" size={14} color="black" />
                            {loadingDirection ? <ActivityIndicator size="small" /> : <Text>{(duration / 1000).toFixed(2)} km</Text>}
                        </View>
                        <View style={styles.iconTextRow}>
                            <Entypo name="back-in-time" size={16} color="black" />
                            {loadingDirection ? <ActivityIndicator size="small" /> : <Text>{(distance / 60).toFixed(0)} min</Text>}
                        </View>
                    </View>
                </View>

                {/*  Image detail */}
                <View style={styles.infoRow}>
                    <TouchableOpacity onPress={() => setImageModalVisible(true)}>
                        <Image source={{ uri: selectedLandmark.image }} style={styles.image} />
                    </TouchableOpacity>
                    <View style={styles.detailsContainer}>
                        <Text style={styles.name}>{selectedLandmark.name}</Text>
                        <View style={styles.locationRow}>
                            <Entypo name="location-pin" size={18} />
                            <Text>{selectedLandmark.address}</Text>
                        </View>
                        <View style={styles.statusRow}>{statusIcon}<Text>{statusText}</Text></View>
                        <View style={styles.statusRow}>
                            <Fontisto name="ticket" size={16} />
                            <Text>
                                Entrance: {selectedLandmark.entranceFee && Number(selectedLandmark.entranceFee) > 0
                                    ? `₱${selectedLandmark.entranceFee}` : "Free"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/*  Opening hours */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Opening Hours & Events</Text>
                    {(() => {
                        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
                        const formatDay = (d: string) => d.charAt(0).toUpperCase() + d.slice(1);

                        return days.map((day, i) => {
                            const hoursData = selectedLandmark.openingHours[day];
                            const hours = !hoursData || hoursData.closed
                                ? "Closed"
                                : `Open from ${convertTo12HourFormat(hoursData.open)} to ${convertTo12HourFormat(hoursData.close)}`;

                            const eventsToday = weeklyEvents.filter(e => e.day === day);

                            return (
                                <View key={i} style={{ marginBottom: 6 }}>
                                    <Text style={[styles.hoursText, hours === "Closed" && styles.closedText]}>
                                        {formatDay(day)}: {hours}
                                    </Text>
                                    {eventsToday.map((ev, idx) => (
                                        <Text key={idx} style={{ fontSize: 13, color: ev.openToPublic ? "#4CAF50" : "#B71C1C" }}>
                                            🎟 {ev.title} ({convertTo12HourFormat(ev.start)} - {convertTo12HourFormat(ev.end)}) {ev.openToPublic ? "" : "(Private)"}
                                        </Text>
                                    ))}
                                </View>
                            );
                        });
                    })()}
                </View>


                {/*  description hehe */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{selectedLandmark.description}</Text>
                </View>

                {/*  Rating */}
                {averageRating !== null && (
                    <View style={styles.ratingRow}>
                        <FontAwesome5 name="star" size={16} color="#E4B343" />
                        <Text style={styles.ratingText}>
                            {averageRating} / 5 ({reviewCount} review{reviewCount > 1 ? "s" : ""})
                        </Text>
                    </View>
                )}

                {/*  Button for direction */}
                <TouchableOpacity onPress={handleGetDirection} disabled={loadingDirection} style={styles.button}>
                    {loadingDirection
                        ? <ActivityIndicator color="white" />
                        : <>
                            <Entypo name="direction" size={22} color="white" />
                            <Text style={styles.buttonText}>Get Direction</Text>
                        </>}
                </TouchableOpacity>

                {/*  Modal for image*/}
                <Modal visible={isImageModalVisible} transparent>
                    <Pressable style={styles.modal} onPress={() => setImageModalVisible(false)}>
                        <Image source={{ uri: selectedLandmark.image }} style={styles.modalImage} />
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
