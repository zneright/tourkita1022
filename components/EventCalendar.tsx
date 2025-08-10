import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../Navigation/types";
import EventDetailModal from "./EventDetailModal";
import { format, parseISO, isToday, isTomorrow } from "date-fns";

type EventWithMeta = {
    title: string;
    time: string;
    locationName: string;
    description: string;
    imageUrl?: string;
    date: string;
};

type GroupedEvents = {
    [date: string]: EventWithMeta[];
};

const EventCalendar = () => {
    const [events, setEvents] = useState<GroupedEvents>({});
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventWithMeta | null>(null);

    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const formatTo12Hour = (time24: string): string => {
        const [hourStr, minute] = time24.split(":");
        const hour = parseInt(hourStr, 10);
        const suffix = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 === 0 ? 12 : hour % 12;
        return `${hour12}:${minute} ${suffix}`;
    };

    useEffect(() => {
        const fetchEventsAndMarkers = async () => {
            setLoading(true);
            try {
                const markersSnapshot = await getDocs(collection(db, "markers"));
                const markersMap: { [id: string]: string } = {};
                markersSnapshot.forEach(doc => {
                    markersMap[doc.id] = doc.data().name;
                });

                const eventsSnapshot = await getDocs(collection(db, "events"));
                const grouped: GroupedEvents = {};

                eventsSnapshot.forEach(doc => {
                    const data = doc.data();
                    const date = data.date;
                    const locationName = markersMap[data.locationId] || "Unknown Location";

                    const eventDate = parseISO(date);
                    if (!isToday(eventDate) && !isTomorrow(eventDate)) return;

                    if (!grouped[date]) grouped[date] = [];

                    grouped[date].push({
                        title: data.title,
                        time: data.time,
                        locationName,
                        description: data.description || "",
                        imageUrl: data.imageUrl || "",
                        date,
                    });

                    // Sort events by time (HH:mm) ascending
                    grouped[date].sort((a, b) => {
                        const timeA = new Date(`1970-01-01T${a.time}:00`);
                        const timeB = new Date(`1970-01-01T${b.time}:00`);
                        return timeA.getTime() - timeB.getTime();
                    });

                });

                setEvents(grouped);
            } catch (error) {
                console.error("Error fetching calendar events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEventsAndMarkers();
    }, []);

    const sortedDates = Object.keys(events).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
    });

    if (loading) {
        return <ActivityIndicator size="large" color="#493628" style={{ marginTop: 20 }} />;
    }

    return (
        <View style={styles.wrapper}>
            <Text style={styles.header}>Events for Today & Tomorrow</Text>
            {sortedDates.length === 0 ? (
                <Text style={styles.noEvents}>No events for today or tomorrow.</Text>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {sortedDates.map((date, index) => {
                        const parsedDate = parseISO(date);
                        const readableDate = format(parsedDate, "MMMM d, yyyy");
                        const label = isToday(parsedDate) ? "Today" : isTomorrow(parsedDate) ? "Tomorrow" : "";

                        return (
                            <View key={index} style={styles.dateSection}>
                                <Text style={styles.dateTitle}>{readableDate}</Text>
                                {label && <Text style={styles.dateLabel}>({label})</Text>}
                                {events[date].map((event, idx) => (
                                    <TouchableOpacity
                                        key={idx}
                                        style={styles.eventCard}
                                        onPress={() => {
                                            setSelectedEvent(event);
                                            setModalVisible(true);
                                        }}
                                    >
                                        <Text style={styles.eventTitle}>{event.title}</Text>
                                        <Text style={styles.eventDetails}>
                                            {event.locationName} — {formatTo12Hour(event.time)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            <TouchableOpacity
                style={styles.calendarButton}
                onPress={() => navigation.navigate("CalendarView")}
            >
                <Text style={styles.calendarButtonText}>View Full Calendar</Text>
            </TouchableOpacity>

            <EventDetailModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                event={selectedEvent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 22,
        marginTop: 20,
        marginBottom: 60,
    },
    header: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#493628",
        marginBottom: 12,
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    dateSection: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        paddingBottom: 10,
    },
    dateTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#493628",
    },
    dateLabel: {
        fontSize: 14,
        color: "#888",
        marginBottom: 6,
    },
    eventCard: {
        backgroundColor: "#F8F4F0",
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    eventTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
    },
    eventDetails: {
        fontSize: 13,
        color: "#666",
        marginTop: 2,
    },
    noEvents: {
        textAlign: "center",
        fontSize: 16,
        color: "#999",
        marginTop: 20,
    },
    calendarButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: "#493628",
        borderRadius: 10,
        alignItems: "center",
    },
    calendarButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default EventCalendar;
