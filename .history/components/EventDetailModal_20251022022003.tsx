import React from "react";
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
import { format, isToday, parse, parseISO } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useLandmark } from "../provider/LandmarkProvider";
import { Linking } from "react-native";

// --- (1) UPDATE THE EVENT TYPE ---
type EventType = {
    id?: string;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    eventStartTime: string;
    eventEndTime?: string;
    address: string;
    customAddress?: { latitude: number; longitude: number; label: string } | string;
    locationId?: string;
    lat?: number;
    lng?: number;
    imageUrl?: string;
    openToPublic?: boolean;
    // Add the recurrence object to the type
    recurrence?: {
        frequency?: 'once' | 'weekly';
        daysOfWeek?: string[];
    };
};

interface Props {
    visible: boolean;
    onClose: () => void;
    event: EventType | null;
}

const EventDetailModal: React.FC<Props> = ({ visible, onClose, event }) => {
    const navigation = useNavigation<any>();
    const { setSelectedLandmark } = useLandmark();
    const [loading, setLoading] = useState(false);
    const [isImageModalVisible, setImageModalVisible] = useState(false);
    const [displayAddress, setDisplayAddress] = useState<string>("");

    useEffect(() => {
        const fetchMarkerName = async () => {
            if (!event) return;
            if (event.customAddress) {
                setDisplayAddress(typeof event.customAddress === "string" ? event.customAddress : event.customAddress.label || "N/A");
            } else if (event.locationId) {
                try {
                    const docRef = doc(db, "markers", event.locationId);
                    const snap = await getDoc(docRef);
                    setDisplayAddress(snap.exists() ? snap.data()?.name || "N/A" : "N/A");
                } catch { setDisplayAddress("N/A"); }
            } else {
                setDisplayAddress(event.address || "N/A");
            }
        };
        fetchMarkerName();
    }, [event]);

    if (!event) {
        return null;
    }

    const start = parseISO(event.startDate);
    const end = event.endDate ? parseISO(event.endDate) : start;

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
        } catch { return timeStr; }
    };

    const formattedStartTime = formatTime(event.eventStartTime);
    const formattedEndTime = event.eventEndTime ? formatTime(event.eventEndTime) : null;

    // --- (2) NEW HELPER FUNCTION TO FORMAT RECURRENCE ---
    const formatRecurrence = () => {
        if (event?.recurrence?.frequency === 'weekly' && event.recurrence.daysOfWeek) {
            const formattedDays = event.recurrence.daysOfWeek
                .map(day => day.charAt(0).toUpperCase() + day.slice(1))
                .join(', ');
            return `Occurs every ${formattedDays}`;
        }
        return null; // Don't show anything for "once" or if data is missing
    };

    const recurrenceText = formatRecurrence();

    const publicStatus = event.openToPublic ? "Open to Public" : "Private Event";
    const publicStatusColor = event.openToPublic ? "#27ae60" : "#c0392b";

    const handleNavigate = async () => { /* ... (This function remains the same) ... */ };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                        <Ionicons name="close" size={28} color="#555" />
                    </TouchableOpacity>
                    <ScrollView contentContainerStyle={styles.content}>
                        {event.imageUrl && (
                            <TouchableOpacity onPress={() => setImageModalVisible(true)}>
                                <Image source={{ uri: event.imageUrl }} style={styles.heroImage} resizeMode="cover" />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.title}>{event.title}</Text>

                        <View style={[styles.cardBase, styles.infoCard]}>
                            <Ionicons name="calendar-outline" size={20} color="#555" />
                            <Text style={styles.infoText}>{displayDate}</Text>
                        </View>

                        {/* --- (3) ADD THE RECURRENCE VIEW TO THE LAYOUT --- */}
                        {recurrenceText && (
                            <View style={[styles.cardBase, styles.infoCard]}>
                                <Ionicons name="repeat-outline" size={20} color="#555" />
                                <Text style={styles.infoText}>{recurrenceText}</Text>
                            </View>
                        )}

                        <View style={[styles.cardBase, styles.infoCard]}>
                            <Ionicons name="time-outline" size={20} color="#555" />
                            <Text style={styles.infoText}>
                                {formattedStartTime}{formattedEndTime ? ` — ${formattedEndTime}` : ""}
                            </Text>
                        </View>

                        <View style={[styles.cardBase, styles.infoCard]}>
                            <Ionicons name="location-outline" size={20} color="#555" />
                            <Text style={styles.infoText} numberOfLines={2}>{displayAddress}</Text>
                        </View>

                        {/* ... (Rest of your component: Description, Status, Button, Modals) ... */}
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
    heroImage: { width: 320, height: 180, borderRadius: 16, marginBottom: 15, backgroundColor: "#ddd" },
    title: { fontSize: 24, fontWeight: "bold", color: "#2c3e50", textAlign: "center", marginBottom: 15 },
    cardBase: { flexDirection: "row", alignItems: "center", backgroundColor: "#f9f9f9", padding: 12, borderRadius: 12, width: "100%", marginBottom: 12 },
    infoCard: { justifyContent: "flex-start" },
    infoText: { fontSize: 14, color: "#555", marginLeft: 10, flex: 1 }, // Added flex: 1
    section: { width: "100%", marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
    description: { fontSize: 15, color: "#555", textAlign: "justify", lineHeight: 22 },
    statusCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#f0f0f0", padding: 12, borderRadius: 12, marginBottom: 20 },
    statusText: { fontSize: 13, fontWeight: "bold", marginLeft: 8 },
    navigateButton: { backgroundColor: "#493628", paddingVertical: 14, borderRadius: 12, width: "100%", alignItems: "center" },
    navigateText: { color: "#fff", fontSize: 16, fontWeight: "600" },
    modal: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center" },
    modalImage: { width: "90%", height: "70%", borderRadius: 12 },
});

export default EventDetailModal;