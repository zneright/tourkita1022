// components/EventDetailModal.tsx
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


type Props = {
    visible: boolean;
    onClose: () => void;
    event: {
        title: string;
        description: string;
        date: string; // e.g., '2025-07-27'
        time: string; // e.g., '13:45'
        locationName: string;
        imageUrl?: string;
    } | null;
};

const EventDetailModal: React.FC<Props> = ({ visible, onClose, event }) => {
    if (!event) return null;

    const eventDate = parse(event.date, "yyyy-MM-dd", new Date());
    const displayDate = isToday(eventDate)
        ? "Today"
        : format(eventDate, "MMMM dd, yyyy");

    // Format time to 12-hour format
    const formattedTime = (() => {
        try {
            const timeDate = parse(event.time, "HH:mm", new Date());
            return format(timeDate, "hh:mm a");
        } catch {
            return event.time; // fallback to original if parsing fails
        }
    })();

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.content}>
                        <Text style={styles.title}>{event.title}</Text>
                        <Text style={styles.subText}>
                            {displayDate} — {formattedTime}
                        </Text>
                        <Text style={styles.location}>{event.locationName}</Text>

                        {event.imageUrl && (
                            <Image
                                source={{ uri: event.imageUrl }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        )}


                        <Text style={styles.description}>
                            {event.description || "No description provided."}
                        </Text>

                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
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
    },
    modalContainer: {
        backgroundColor: "#fff",
        width: "90%",
        borderRadius: 12,
        maxHeight: "80%",
        overflow: "hidden",
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 6,
    },
    subText: {
        fontSize: 14,
        color: "#555",
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: "#777",
        marginBottom: 12,
    },
    image: {
        width: "100%",
        height: 180,
        borderRadius: 8,
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        color: "#444",
        marginBottom: 20,
    },
    closeButton: {
        alignSelf: "center",
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#493628",
        borderRadius: 8,
    },
    closeButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default EventDetailModal;
