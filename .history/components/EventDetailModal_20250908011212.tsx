import React from "react";
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
} from "react-native";
import { format, isToday, parse } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
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
};

const EventDetailModal: React.FC<Props> = ({ visible, onClose, event }) => {
    if (!event) return null;

    const start = parse(event.startDate, "yyyy-MM-dd", new Date());
    const end = event.endDate ? parse(event.endDate, "yyyy-MM-dd", start) : start;

    let displayDate = "";
    const today = new Date();

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

                        {/* Date & Time Card */}
                        <View style={[styles.cardBase, styles.infoCard]}>
                            <View style={styles.inlineInfo}>
                                <Ionicons name="calendar-outline" size={20} color="#555" />
                                <Text style={styles.infoText}>{displayDate}</Text>
                            </View>
                        </View>

                        <View style={[styles.cardBase, styles.infoCard]}>
                            <View style={styles.inlineInfo}>
                                <Ionicons name="time-outline" size={20} color="#555" />
                                <Text style={styles.infoText}>
                                    {formattedStartTime}
                                    {formattedEndTime ? ` — ${formattedEndTime}` : ""}
                                </Text>
                            </View>
                        </View>


                        <View style={[styles.cardBase, styles.addressCard]}>
                            <Ionicons name="location-outline" size={20} color="#555" />
                            <Text style={styles.infoText} numberOfLines={2} ellipsizeMode="tail">
                                {event.address}
                            </Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Description</Text>
                            <Text style={styles.description}>
                                {event.description || "No description provided."}
                            </Text>
                        </View>

                        <View style={styles.statusCard}>
                            <Ionicons name="people-outline" size={20} color={publicStatusColor} />
                            <Text style={[styles.statusText, { color: publicStatusColor }]}>
                                {publicStatus}
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 10,
    },
    modalContainer: {
        width: "95%",
        maxHeight: "85%",
        backgroundColor: "#fff",
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    closeIcon: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 10,
    },
    content: {
        paddingTop: 40,
        paddingHorizontal: 20,
        alignItems: "center",
        paddingBottom: 20,
    },
    heroImage: {
        width: "100%",
        height: 220,
        borderRadius: 16,
        marginBottom: 15,
        backgroundColor: "#ddd",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#2c3e50",
        textAlign: "center",
        marginBottom: 15,
    },

    /** Reusable card base */
    cardBase: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 12,
        width: "100%",
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    infoCard: {
        justifyContent: "space-between",
    },

    addressCard: {
        // no justifyContent → stays left-aligned
    },

    inlineInfo: {
        flexDirection: "row",
        alignItems: "center",
    },

    infoText: {
        fontSize: 11,
        color: "#555",
        marginLeft: 8,
    },

    section: {
        width: "100%",
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2c3e50",
        marginBottom: 6,
    },
    description: {
        fontSize: 15,
        color: "#555",
        textAlign: "justify",
        lineHeight: 20,
    },
    statusCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "bold",
        marginLeft: 8,
    },
});

export default EventDetailModal;
