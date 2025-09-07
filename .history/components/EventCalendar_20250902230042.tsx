import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import EventDetailModal from "./EventDetailModal";
import { isToday, isTomorrow, parseISO } from "date-fns";

type EventType = {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    locationId?: string;
    address: string;
    eventStartTime?: string;
    eventEndTime?: string;
    date?: string;
    openToPublic?: boolean;
};

const EventCalendar = () => {
    const [events, setEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

    const formatTo12Hour = (time24?: string) => {
        if (!time24) return "N/A";
        const [hourStr, minute] = time24.split(":");
        const hour = parseInt(hourStr, 10);
        const suffix = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 === 0 ? 12 : hour % 12;
        return `${hour12}:${minute} ${suffix}`;
    };

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const eventsSnap = await getDocs(collection(db, "events"));
                const fetchedEvents: EventType[] = [];

                for (const docSnap of eventsSnap.docs) {
                    const data = docSnap.data();

                    let address = "Address not available";
                    if (data.locationId) {
                        const markerRef = doc(db, "markers", data.locationId);
                        const markerSnap = await getDoc(markerRef);
                        if (markerSnap.exists()) {
                            const markerData = markerSnap.data();
                            address = markerData.name || markerData.address || "Address not available";
                        }
                    }

                    const eventDate = data.date ? parseISO(data.date) : new Date();
                    if (isToday(eventDate) || isTomorrow(eventDate)) {
                        fetchedEvents.push({
                            id: docSnap.id,
                            title: data.title ?? "Untitled Event",
                            description: data.description,
                            imageUrl: data.imageUrl,
                            locationId: data.locationId,
                            address,
                            eventStartTime: data.eventStartTime,
                            eventEndTime: data.eventEndTime,
                            date: data.date,
                            openToPublic: data.openToPublic ?? false,
                        });
                    }
                }

                fetchedEvents.sort(
                    (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()
                );

                setEvents(fetchedEvents);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) {
        return (
            <ActivityIndicator size="large" color="#493628" style={{ marginTop: 20 }} />
        );
    }

    return (
        <View style={styles.wrapper}>
            <Text style={styles.header}>Events for Today & Tomorrow</Text>
            {events.length === 0 ? (
                <Text style={styles.noEvents}>No events for today or tomorrow.</Text>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {events.map((event) => {
                        const label =
                            new Date(event.date!).toDateString() === new Date().toDateString()
                                ? "Today"
                                : "Tomorrow";
                        return (
                            <TouchableOpacity
                                key={event.id}
                                style={styles.eventCard}
                                onPress={() => {
                                    setSelectedEvent(event);
                                    setModalVisible(true);
                                }}
                            >
                                <Text style={styles.eventTitle}>{event.title}</Text>
                                <Text style={styles.eventDetails}>
                                    {event.address}: {formatTo12Hour(event.eventStartTime)}
                                    {event.eventEndTime ? ` - ${formatTo12Hour(event.eventEndTime)}` : ""} ({label})
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}

            <EventDetailModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                event={selectedEvent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: { paddingHorizontal: 22, marginTop: 20, marginBottom: 60 },
    header: { fontSize: 20, fontWeight: "bold", color: "#493628", marginBottom: 12 },
    scrollContainer: { paddingBottom: 20 },
    eventCard: { backgroundColor: "#F8F4F0", padding: 10, borderRadius: 8, marginBottom: 8 },
    eventTitle: { fontSize: 15, fontWeight: "600", color: "#333" },
    eventDetails: { fontSize: 13, color: "#666", marginTop: 2 },
    noEvents: { textAlign: "center", fontSize: 16, color: "#999", marginTop: 20 },
});

export default EventCalendar;
