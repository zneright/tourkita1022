import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { format, isToday, parse } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useLandmark } from "../provider/LandmarkProvider";

interface Props {
    visible: boolean;
    onClose: () => void;
    event: EventType | null;
}
type EventType = {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    eventStartTime: string;
    eventEndTime?: string;
    address: string;
    imageUrl?: string;
    openToPublic?: boolean;
    customAddress?: { latitude: number; longitude: number; label: string };
    locationId?: string;
};

const EventDetailModal: React.FC<Props> = ({ visible, onClose, event }) => {
    const navigation = useNavigation<any>();
    const { setSelectedLandmark } = useLandmark();
    const [loading, setLoading] = useState(false);

    if (!event) return null;

    const start = parse(event.startDate, "yyyy-MM-dd", new Date());
    const end = event.endDate ? parse(event.endDate, "yyyy-MM-dd", start) : start;

    let displayDate = "";
    if (isToday(start) && !event.endDate) {
        displayDate = "Today";
    } else if (start.getTime() === end.getTime()) {
        displayDate = format(start, "MMMM dd, yyyy");
    } else {
        displayDate = `${format(start, "MMMM dd, yyyy")} — ${format(end, "MMMM dd, yyyy")}`;
    }

    const formatTime = (timeStr?: string) => {
        if (!timeStr) return "N/A";
        try {
            const t = parse(timeStr, "HH:mm", new Date());
            return format(t, "hh:mm a");
        } catch {
            return timeStr;
        }
    };

    const formattedStartTime = formatTime(event.eventStartTime);
    const formattedEndTime = event.eventEndTime ? formatTime(event.eventEndTime) : null;

    const publicStatus = event.openToPublic ? "Open to Public" : "Not Open to Public";
    const publicStatusColor = event.openToPublic ? "#27ae60" : "#c0392b";

    const handleNavigate = async () => {
        try {
            setLoading(true);

            let target: any = null;

            if (event.customAddress) {
                target = {
                    name: event.title,
                    latitude: event.customAddress.latitude,
                    longitude: event.customAddress.longitude,
                };
            } else if (event.locationId) {
                const docRef = doc(db, "markers", event.locationId);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    target = { id: snap.id, ...snap.data() };
                }
            }

            if (target) {
                setSelectedLandmark(target);
                navigation.navigate("Maps", {
                    latitude: target.latitude,
                    longitude: target.longitude,
                    name: target.name,
                });
            } else {
                navigation.navigate("MapScreen");
            }

            onClose();
        } catch (err) {
            console.error("Navigation failed:", err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                        <Ionicons name="close" size={28} color="#555" />
                    </TouchableOpacity>

                    <ScrollView contentContainerStyle={styles.content}>
                        {event.imageUrl && (
                            <Image
                                source={{ uri: event.imageUrl }}
                                style={styles.heroImage}
                                resizeMode="cover"
                            />
                        )}

                        <Text style={styles.title}>{event.title}</Text>

                        <View style={[styles.cardBase, styles.infoCard]}>
                            <Ionicons name="calendar-outline" size={20} color="#555" />
                            <Text style={styles.infoText}>{displayDate}</Text>
                        </View>

                        <View style={[styles.cardBase, styles.infoCard]}>
                            <Ionicons name="time-outline" size={20} color="#555" />
                            <Text style={styles.infoText}>
                                {formattedStartTime}
                                {formattedEndTime ? ` — ${formattedEndTime}` : ""}
                            </Text>
                        </View>
                        =
                        <View style={[styles.cardBase, styles.addressCard]}>
                            <Ionicons name="location-outline" size={20} color="#555" />
                            <Text style={styles.infoText} numberOfLines={2}>
                                {event.customAddress?.label || event.address}
                            </Text>
                        </View>
                        =
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.description}>
                                {event.description || "No description provided."}
                            </Text>
                        </View>
                        =
                        <View style={styles.statusCard}>
                            <Ionicons name="people-outline" size={20} color={publicStatusColor} />
                            <Text style={[styles.statusText, { color: publicStatusColor }]}>
                                {publicStatus}
                            </Text>
                        </View>

                        {/* Navigate Button */}
                        <TouchableOpacity
                            style={styles.navigateButton}
                            onPress={handleNavigate}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.navigateText}>Navigate</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 10 },
    modalContainer: { width: "95%", maxHeight: "85%", backgroundColor: "#fff", borderRadius: 20, overflow: "hidden" },
    closeIcon: { position: "absolute", top: 10, right: 10, zIndex: 10 },
    content: { paddingTop: 40, paddingHorizontal: 20, alignItems: "center", paddingBottom: 20 },
    heroImage: { width: "100%", height: 220, borderRadius: 16, marginBottom: 15, backgroundColor: "#ddd" },
    title: { fontSize: 24, fontWeight: "bold", color: "#2c3e50", textAlign: "center", marginBottom: 15 },
    cardBase: { flexDirection: "row", alignItems: "center", backgroundColor: "#f9f9f9", padding: 12, borderRadius: 12, width: "100%", marginBottom: 12 },
    infoCard: { justifyContent: "flex-start" },
    infoText: { fontSize: 12, color: "#555", marginLeft: 8 },
    section: { width: "100%", marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
    description: { fontSize: 15, color: "#555", textAlign: "justify", lineHeight: 20 },
    statusCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#f0f0f0", padding: 12, borderRadius: 12, marginBottom: 20 },
    statusText: { fontSize: 13, fontWeight: "bold", marginLeft: 8 },
    navigateButton: { backgroundColor: "#493628", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, width: "100%", alignItems: "center" },
    navigateText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default EventDetailModal;
